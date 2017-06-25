# CENode IoT Demo

This is a simple demo illustrating how CENode may be used to interact with IoT devices - in particluar, Philips hue bulbs.

If unfamiliar with CENode, then please check out [that project](https://github.com/flyingsparx/CENode) first and read the [wiki](https://github.com/flyingsparx/CENode/wiki) and glance at the [documentation](http://cenode.io/docs/documentation.pdf) and [paper](http://cenode.io/docs/intro.pdf).

## Overview

The key conrtibution made by this demonstration is the addition of a card handler for instances of type `iot card`. Such cards support additional attributes further to the more traditional CE cards (such as `ask`, `tell`, `nl`, etc.) that allow each one to represent an instruction that the local agent can act upon.

In this case, the `iot card` handler makes a request to a Philips hue bridge with parameters relevant to the properties of the card.

For example,

```
there is an iot card named {uid} that is to the agent House and has 'instruction' as content and targets the hue bulb 'Kitchen' and has 'on' as power
```

will tell CENode to make an HTTP request to the hue bridge to turn on the hue bulb named 'Kitchen'. 

## Running the demo

If you have Philips hue bulbs and a working hue bridge then you can run this demo.

1. Clone repository: `git clone git@github.com:flyingsparx/CENode-IoT.git`
1. Change into the repository: `cd CENode-IoT`
1. Install dependencies: `npm install`
1. Find your Philips hue's address on your local network and [generate a username](https://developers.meethue.com/documentation/configuration-api#71_create_user) that you'll use to authenticate your requests
1. Update the model in [app.js](https://github.com/flyingsparx/CENode-IoT/blob/master/app.js#L9) to use the bridge address and the generated username as the `token`
1. Startup a quick webserver: `python -m SimpleHTTPServer`
1. Visit [localhost:8000](http://localhost:8000)
