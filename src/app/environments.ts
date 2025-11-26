export const environment = {
  apiUrl: 'http://192.168.253.128:8080/api/v1',
  keycloak: {
    config: {
      url: 'http://192.168.253.128:8082',
      realm: 'realm-ps-dev',
      clientId: 'client-ps-frontend-app'
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false,
    }
  }
};