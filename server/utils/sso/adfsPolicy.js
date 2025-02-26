const fs = require('fs');
const util = require('util');
const crypto = require('crypto');
const JWT = require("jsonwebtoken");
const adfsPassport = require('./adfsPassport');
const { MetadataFactory } = require("./metadataFactory");
const { SystemSettings } = require("../../models/systemSettings");
const { User } = require("../../models/user");
const { EventLogs } = require("../../models/eventLogs");

var adfsPassportConfig;

function getFirst16MD5(input) {
  // Create an MD5 hash instance
  const hash = crypto.createHash('md5');
  const timestamp = Date.now();
  const combined = `${input}-${timestamp}`;

  // Update the hash with the input data
  hash.update(combined);

  // Compute the digest (hash value) and return the first 16 characters
  return hash.digest('hex').substring(0, 16);
}

function makeJWT(info = {}, expiry = "30d") {
  if (!process.env.JWT_SECRET)
    throw new Error("Cannot create JWT as JWT_SECRET is unset.");
  return JWT.sign(info, process.env.JWT_SECRET, { expiresIn: expiry });
}

async function getSamlConfig() {
  try {
    const adfs_entry_point = (await SystemSettings.get({ label: "adfs_sso_url" }))?.value || process.env.SAML_ENTRY_POINT;
    const adfs_issuer = (await SystemSettings.get({ label: "adfs_sso_issuer" }))?.value || process.env.SAML_ISSUER;
    const adfs_callback = (await SystemSettings.get({ label: "adfs_sso_callback" }))?.value || process.env.SAML_CALLBACK_HOST;

    // const adfs_entry_point = process.env.SAML_ENTRY_POINT;
    // const adfs_issuer =  process.env.SAML_ISSUER;
    // const adfs_callback = process.env.SAML_CALLBACK_HOST;

    return {
      app: {
        name: 'Passport SAML strategy example',
        port: process.env.PORT || 3000
      },
      passport: {
        strategy: 'saml',
        saml: {
          entryPoint: adfs_entry_point,
          issuer: adfs_issuer,
          callbackUrl: `${adfs_callback.replace(/\/$/, '')}/adfs/auth/postResponse`,
          idpCert: (() => {
            try {
              return fs.readFileSync(process.env.SAML_ADFS_CERT, "utf-8");
            } catch (error) {
              console.error('SAML Setup failed, error reading the IDP certificate file: \n', error);
              return null; // Handle this as needed
            }
          })(),
          authnContext: ['http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password'],
          identifierFormat: null,
          acceptedClockSkewMs: -1,
          signatureAlgorithm: 'sha256'
        }
      }
    };
  } catch (error) {
    throw new Error('ADFSPolicy is not configured yet: ', error);
  }
}


async function setupPassport(passport) {
  if (!adfsPassportConfig) {
    adfsPassportConfig = await getSamlConfig();
  }
  adfsPassport(passport, adfsPassportConfig);
  return adfsPassportConfig;
}

const ADFSPolicy = {

  enableSSORoute: async function (app, passport) {
    const enable_SSO = MetadataFactory.checkSSOEnabelFlagSetTrue();
    if (enable_SSO) {
      try {
        // Set up ADFS routes, and this is async for fetching setting info
        let adfsConfig = await setupPassport(passport);

        app.get('/adfs/login-adfs-sso', (req, res, next) => {

          passport.authenticate(adfsConfig.passport.strategy, (err, user, info) => {
            if (err) {
              console.error('Authentication error:', err);
              return res.redirect('/adfs/error');
            }
            if (!user) {
              console.warn('Authentication failed:', info);
              return res.redirect('/adfs/error');
            }
            req.logIn(user, (err) => {
              if (err) {
                console.error('Login error:', err);
                return res.redirect('/adfs/error');
              }
              // Successfully authenticated and logged in
              return res.redirect('/');
            });
          })(req, res, next);
        });

        app.post('/adfs/auth/postResponse',
          passport.authenticate(adfsConfig.passport.strategy, {
            failureRedirect: '/adfs/error',
            failureFlash: true
          }),
          async function (req, res) {

            console.debug("User: " + util.inspect(req.user));
            
            // create login user, body: {username, password}
            let username = req.user['upn'];
            let usergroup = req.user['group']; //  ["default", "admin", "manager"]
            let password = getFirst16MD5(username);
            let reqUser = { username: username, password: password, role: usergroup, skipPasswordCheck: true };

            let user = await User._get({ username: String(username) });

            if (!user) {
              // Create new user
              await EventLogs.logEvent(
                "create_adfs_user",
                {
                  ip: req.ip || "Unknown IP",
                  username: username || "Unknown user",
                },
                user?.id
              );
              user = await User.create(reqUser);
            }

            // Log login event
            await EventLogs.logEvent(
              "login_event",
              {
                ip: req.ip || "Unknown IP",
                username: username || "Unknown user",
              },
              user?.id
            );

            const userObj = {
              valid: true,
              user: User.filterFields(user),
              token: makeJWT(
                { id: user.id, username: user.username },
                "30d"
              ),
              message: null,
            };

            res.redirect(`https://${req.hostname}/login?sso=adfs&user=${encodeURIComponent(JSON.stringify(userObj))}`);
          }
        );

        app.get('/adfs/error', function (req, res) {
          res.status(401).json({ message: 'Authentication failed' });
        });

        return enable_SSO; // Return the value instead of resolving a promise

      } catch (error) {
        console.error('Error setting up ADFS routes:', error);
        throw error; // Throw error for upstream handling
      }
    } else {
      return false; // Return false if SSO is not enabled
    }
  }
}


// Export the ADFSPolicy object and a function to setup passport
module.exports.ADFSPolicy = ADFSPolicy;
