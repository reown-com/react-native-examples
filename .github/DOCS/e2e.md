# E2E Testing

The tests are written using a framework called **Maestro**  
Maestro docs -> [link](https://maestro.mobile.dev/api-reference/commands)

The app builds are uploaded to the **Maestro Cloud**  
Maestro cloud console -> [link](https://console.mobile.dev/)  
Maestro cloud docs -> [link](https://cloud.mobile.dev/)  

The tests are stored in the root of the repo under `.maestro`  
There is a workflow template you can use to quickly add other projects to the test suite

## Creating tests
Create a flow file in the `.maestro` folder  
Shared flows/utils can be stored in the `.maestro/subflows` folder
Ensure the flow has the correct `appId` at the top of each test

Flows can be created quickly with *maestro studio*
Maestro studio docs -> [link](https://maestro.mobile.dev/getting-started/maestro-studio)

## Running tests
- `yarn e2e` to run tests
- `yarn e2e:studio` to open *maestro studio*
- `yarn e2e:upload` to manually upload to maestro cloud