import { KeycloakService } from 'keycloak-angular';
import { environment } from '../environments/environment';

export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
    return (): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            try {
                keycloak.init({
                    config: {
                        url: environment.keycloak.url,
                        realm: environment.keycloak.realm,
                        clientId: environment.keycloak.clientId,
                    },
                    initOptions: {
                        onLoad: 'login-required',
                        checkLoginIframe: false,
                    },
                    enableBearerInterceptor: true,
                    bearerPrefix: 'Bearer',
                    bearerExcludedUrls: ['/assets'],
                }).then((authenticated) => {
                    resolve(authenticated);
                }).catch((error) => {
                    console.error('Keycloak initialization failed', error);
                    reject(error);
                });
            } catch (error) {
                console.error('Keycloak initialization error', error);
                reject(error);
            }
        });
    };
}