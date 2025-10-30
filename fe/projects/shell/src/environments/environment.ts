export const environment = {
    production: false,
    keycloak: {
        url: 'http://localhost:9090',
        realm: 'pet-angular-realm',
        clientId: 'petstore-client'
    },
    api: {
        auth: 'http://localhost:8090',
        product: 'http://localhost:8082',
        cart: 'http://localhost:8083',
        gateway: 'http://localhost:8080'
    }
};