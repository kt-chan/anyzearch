async function startServer() {
  process.env.NODE_ENV === "development"
  ? require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` })
  : require("dotenv").config();
  
  require("./utils/logger")();
  const express = require("express");
  const bodyParser = require("body-parser");
  const cors = require("cors");
  const passport = require("passport");
  const path = require("path");
  const { reqBody } = require("./utils/http");
  const { systemEndpoints } = require("./endpoints/system");
  const { workspaceEndpoints } = require("./endpoints/workspaces");
  const { chatEndpoints } = require("./endpoints/chat");
  const { embeddedEndpoints } = require("./endpoints/embed");
  const { embedManagementEndpoints } = require("./endpoints/embedManagement");
  const { getVectorDbClass } = require("./utils/helpers");
  const { adminEndpoints } = require("./endpoints/admin");
  const { inviteEndpoints } = require("./endpoints/invite");
  const { utilEndpoints } = require("./endpoints/utils");
  const { developerEndpoints } = require("./endpoints/api");
  const { extensionEndpoints } = require("./endpoints/extensions");
  const { bootHTTP, bootSSL } = require("./utils/boot");
  const { workspaceThreadEndpoints } = require("./endpoints/workspaceThreads");
  const { documentEndpoints } = require("./endpoints/document");
  const { agentWebsocket } = require("./endpoints/agentWebsocket");
  const { experimentalEndpoints } = require("./endpoints/experimental");
  const app = express();
  const apiRouter = express.Router();
  const FILE_LIMIT = "3GB";


  // //@DEBUG @SSO - (C)ktchan - ADFS SSO Setup
  // const util = require('util');
  // const crypto = require('crypto');
  // const JWT = require("jsonwebtoken");
  // const { User } = require("./models/user");
  // const { EventLogs } = require("./models/eventLogs");
  // const env = process.env.NODE_ENV === "development" ? "development" : "production";
  // const { MetadataFactory } = require("./utils/sso/metadataFactory");
  const { ADFSPolicy } = require("./utils/sso/adfsPolicy");


  // async function enableSSORoute(app, passport) {
  //   const enable_SSO = MetadataFactory.checkSSOEnabelFlagSetTrue();
  //   if (enable_SSO) {
  //     try {
  //       // Set up ADFS routes, and this is async for fetching setting info
  //       let adfsConfig = await ADFSPolicy.setupPassport(passport);

  //       app.get('/adfs/login-adfs-sso', (req, res, next) => {

  //         passport.authenticate(adfsConfig.passport.strategy, (err, user, info) => {
  //           if (err) {
  //             console.error('Authentication error:', err);
  //             return res.redirect('/adfs/error');
  //           }
  //           if (!user) {
  //             console.warn('Authentication failed:', info);
  //             return res.redirect('/adfs/error');
  //           }
  //           req.logIn(user, (err) => {
  //             if (err) {
  //               console.error('Login error:', err);
  //               return res.redirect('/adfs/error');
  //             }
  //             // Successfully authenticated and logged in
  //             return res.redirect('/');
  //           });
  //         })(req, res, next);
  //       });

  //       app.post('/adfs/auth/postResponse',
  //         passport.authenticate(adfsConfig.passport.strategy, {
  //           failureRedirect: '/adfs/error',
  //           failureFlash: true
  //         }),
  //         async function (req, res) {
  //           console.log("User: " + util.inspect(req.user));
  //           // create login user 
  //           // body: {username, password}
  //           let username = req.user['upn'];
  //           let usergroup = req.user['group']; //  ["default", "admin", "manager"]
  //           let password = getFirst16MD5(username);
  //           let reqUser = { username: username, password: password, role: usergroup, skipPasswordCheck: true };

  //           let user = await User._get({ username: String(username) });

  //           if (!user) {
  //             // Create new user
  //             await EventLogs.logEvent(
  //               "create_adfs_user",
  //               {
  //                 ip: req.ip || "Unknown IP",
  //                 username: username || "Unknown user",
  //               },
  //               user?.id
  //             );
  //             user = await User.create(reqUser);
  //           }

  //           // Log login event
  //           await EventLogs.logEvent(
  //             "login_event",
  //             {
  //               ip: req.ip || "Unknown IP",
  //               username: username || "Unknown user",
  //             },
  //             user?.id
  //           );

  //           const userObj = {
  //             valid: true,
  //             user: User.filterFields(user),
  //             token: makeJWT(
  //               { id: user.id, username: user.username },
  //               "30d"
  //             ),
  //             message: null,
  //           };

  //           res.redirect(`https://${req.hostname}/login?sso=adfs&user=${encodeURIComponent(JSON.stringify(userObj))}`);
  //         }
  //       );

  //       app.get('/adfs/error', function (req, res) {
  //         res.status(401).json({ message: 'Authentication failed' });
  //       });

  //       return enable_SSO; // Return the value instead of resolving a promise

  //     } catch (error) {
  //       console.error('Error setting up ADFS routes:', error);
  //       throw error; // Throw error for upstream handling
  //     }
  //   } else {
  //     return false; // Return false if SSO is not enabled
  //   }
  // }

  // function getFirst16MD5(input) {
  //   // Create an MD5 hash instance
  //   const hash = crypto.createHash('md5');
  //   const timestamp = Date.now();
  //   const combined = `${input}-${timestamp}`;

  //   // Update the hash with the input data
  //   hash.update(combined);

  //   // Compute the digest (hash value) and return the first 16 characters
  //   return hash.digest('hex').substring(0, 16);
  // }

  // function makeJWT(info = {}, expiry = "30d") {
  //   if (!process.env.JWT_SECRET)
  //     throw new Error("Cannot create JWT as JWT_SECRET is unset.");
  //   return JWT.sign(info, process.env.JWT_SECRET, { expiresIn: expiry });
  // }

  async function initializeSSLServer() {
    if (process.env.ENABLE_HTTPS) {
      app.use(passport.initialize());
      app.use(passport.session());
      await ADFSPolicy.enableSSORoute(app, passport);
      bootSSL(app, process.env.SERVER_PORT || 3001);
    };
  }

  const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  }

  app.use(cors(corsOptions));
  app.use(bodyParser.text({ limit: FILE_LIMIT }));
  app.use(bodyParser.json({ limit: FILE_LIMIT }));
  app.use(
    bodyParser.urlencoded({
      limit: FILE_LIMIT,
      extended: true,
    })
  );

  if (!!process.env.ENABLE_HTTPS) {
    await initializeSSLServer();
  } else {
    require("@mintplex-labs/express-ws").default(app); // load WebSockets in non-SSL mode.
  }

  app.use("/api", apiRouter);
  systemEndpoints(apiRouter);
  extensionEndpoints(apiRouter);
  workspaceEndpoints(apiRouter);
  workspaceThreadEndpoints(apiRouter);
  chatEndpoints(apiRouter);
  adminEndpoints(apiRouter);
  inviteEndpoints(apiRouter);
  embedManagementEndpoints(apiRouter);
  utilEndpoints(apiRouter);
  documentEndpoints(apiRouter);
  agentWebsocket(apiRouter);
  experimentalEndpoints(apiRouter);
  developerEndpoints(app, apiRouter);
  // Externally facing embedder endpoints
  embeddedEndpoints(apiRouter);

  const { MetaGenerator } = require("./utils/boot/MetaGenerator");
  const { exceptions } = require("winston");
  const IndexPage = new MetaGenerator();

  app.use(
    express.static(path.resolve(__dirname, "public"), {
      extensions: ["js"],
      setHeaders: (res) => {
        // Disable I-framing of entire site UI
        res.removeHeader("X-Powered-By");
        res.setHeader("X-Frame-Options", "DENY");
      },
    })
  );

  app.use("/", function (_, response) {
    IndexPage.generate(response);
    return;
  });

  app.get("/robots.txt", function (_, response) {
    response.type("text/plain");
    response.send("User-agent: *\nDisallow: /").end();
  });

  if (process.env.NODE_ENV === "development") {
    // Debug route for development connections to vectorDBs
    apiRouter.post("/v/:command", async (request, response) => {
      try {
        const VectorDb = getVectorDbClass();
        const { command } = request.params;
        if (!Object.getOwnPropertyNames(VectorDb).includes(command)) {
          response.status(500).json({
            message: "invalid interface command",
            commands: Object.getOwnPropertyNames(VectorDb),
          });
          return;
        }

        try {
          const body = reqBody(request);
          const resBody = await VectorDb[command](body);
          response.status(200).json({ ...resBody });
        } catch (e) {
          // console.error(e)
          console.error(JSON.stringify(e));
          response.status(500).json({ error: e.message });
        }
        return;
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    });
  }


  // Error handling for 404 - Not Found
  app.all("*", function (_, response) {
    response.sendStatus(404).send("Sorry, that route doesn't exist.");
  });

  // In non-https mode we need to boot at the end since the server has not yet
  // started and is `.listen`ing.
  if (!process.env.ENABLE_HTTPS) {
    bootHTTP(app, process.env.SERVER_PORT || 3001);
  }
}

// Start the server
startServer().catch(error => {
  console.error("Failed to start server:", error);
});