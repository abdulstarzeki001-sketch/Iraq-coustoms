// Sanitized local-only adapter. The uploaded source contained an exposed credential.
// Cloud sync is intentionally DISABLED until a secure server-side auth design is deployed.
window.App = window.App || {};
(function(App){
 App.sync = {
  ready: async () => false,
  push: () => {},
  pull: async () => null,
  pullAll: async () => {}
 };
})(window.App);
