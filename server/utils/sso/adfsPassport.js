const SamlStrategy = require('passport-saml').Strategy;

module.exports = function (passport, config) {

  const groupsFunction = function (profile) {
    // Split the string by the delimiter ','
    const parts = profile['http://schemas.xmlsoap.org/claims/Group'];

    if (parts.some(part => part === 'admin')) {
      return 'admin';
    }

    if (parts.some(part => part === 'manager')) {
      return 'manager';
    }

    if (parts.some(part => part === 'default')) {
      return 'default';
    }
    
    return null;
  }

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  passport.use(new SamlStrategy(
    config.passport.saml,
    function (profile, done) {
      return done(null,
        {
          upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'],
          displayName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          email: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
          group: groupsFunction(profile),
          // e.g. if you added a Group claim
          // group: profile['http://schemas.xmlsoap.org/claims/Group']
        });
    }
  )
  );

};