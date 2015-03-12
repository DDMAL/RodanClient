import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

import Cookie from "../Helpers/Cookie";
import { mapFromJsonObject } from '../Helpers/Utilities';
import Events from '../Events';


class ServerController extends Marionette.Object
{
    constructor(configuration)
    {
        super();
        this.rodanChannel = Radio.channel('rodan');

        this.rodanServer = configuration.rodanServer;
        this.authenticationType = configuration.authenticationType;
        this.authenticationToken = configuration.authenticationToken;
        this.routes = null;
        this.serverConfiguration = null;
        this.activeUser = null;

        this.rodanChannel.on(Events.RoutesLoaded, () =>
        {
            //console.debug('Routes Loaded');
        });

        this.CSRFToken = new Cookie('csrftoken');

        this.getRoutes();
    }

    /*
    * Fetches the routes from the Rodan server. This is the first function to be called in the
    * Rodan loading process. It hits the root endpoint on the Rodan server and from there downloads
    * all of the path endpoints required to automatically configure the client application.
    * */
    getRoutes()
    {
        var routeRequest = new XMLHttpRequest();

        // FYI: the use of the Fat arrow maps `this` to `ServerController`, not the request object.
        routeRequest.onload = (event) =>
        {
            if (routeRequest.responseText && routeRequest.status === 200)
            {
                var resp = JSON.parse(routeRequest.responseText);

                this.routes = mapFromJsonObject(resp.routes);
                this.serverConfiguration = mapFromJsonObject(resp.configuration);

                this.rodanChannel.trigger(Events.RoutesLoaded);
            }
            else
            {
                console.error('Routes could not be loaded from the server.');
            }
        };

        routeRequest.open('GET', this.rodanServer, true);
        routeRequest.setRequestHeader('Accept', 'application/json');
        routeRequest.send();
    }

    get authenticationRoute()
    {
        switch (this.authenticationType)
        {
            case 'session':
                return this.routeForRouteName('session-auth');
            case 'token':
                return this.routeForRouteName('token-auth');
            default:
                console.error('An acceptable Authentication Type was not provided');
                break;
        }
    }

    get statusRoute()
    {
        return this.routeForRouteName('session-status');
    }

    get logoutRoute()
    {
        return this.routeForRouteName('session-close');
    }

    routeForRouteName(aName)
    {
        if (this.routes.has(aName))
        {
            return this.routes.get(aName);
        }
        else
        {
            return null;
        }
    }
}

export default ServerController;