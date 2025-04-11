# Introduction
Our application is built to assist users with trip planning, while also creating a community.  <br>
This repository is for backend of the application. To get the frontend repo, [click here](https://github.com/julianhuangtwn/Tanken-Go-Frontend) <br>

## Installation instructions
**Pre-requisite**<br><br>
Our application uses 3rd party services such as OpenAI, Unsplash, and will require API keys.<br>
Create API keys:<br>
- [Unsplash](https://unsplash.com/documentation#creating-a-developer-account)<br>
- [OpenAI](https://platform.openai.com/api-keys)<br>

Create JWT token secret (see documentation):<br>
- [jwt.io](jwt.io)<br><br>
## Starting in local device
1. Ensure that the backend is running (backend link)
2. Open VSCode
3. Use the bash or command line and run the command <br>
`git clone https://github.com/julianhuangtwn/Tanken-Go-Frontend.git`
4. Run the command <br>
`npm i`
5. Create a `.env` file at the root of the project
6. Copy and paste into `.env` file: 
<pre><code>DB_PASS = TankenGo2025!@
DB_URL = (description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ca-toronto-1.oraclecloud.com))(connect_data=(service_name=gfef4fff1c3b822_tankengo_medium.adb.oraclecloud.com))))
DB_USER = kchung33
JWT_SECRET =/*your secret key*/
LOG_LEVEL = info
OPENAI_API_KEY = /*OpenAI API Key*/
UNSPLASH_ACCESS_KEY = /*Unsplash API  Access Key*/
UNSPLASH_SECRET_KEY = /*Unsplash API Secret Key*/ </code></pre>
7. Run the command `npm run dev`
8. Visit localhost:8000
## Deploying the application online
**Instructions:**
1. Fork this repository
2. Go to Render
3. Sign in using github (SSO)
4. Go to +Add new > Web Service
5. Select the forked repository
6. In the Environment Variables, include:
<pre><code>DB_PASS = TankenGo2025!@
DB_URL = (description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ca-toronto-1.oraclecloud.com))(connect_data=(service_name=gfef4fff1c3b822_tankengo_medium.adb.oraclecloud.com))))
DB_USER = kchung33
JWT_SECRET =/*your secret key*/
LOG_LEVEL = info
OPENAI_API_KEY = /*OpenAI API Key*/
UNSPLASH_ACCESS_KEY = /*Unsplash API  Access Key*/
UNSPLASH_SECRET_KEY = /*Unsplash API Secret Key*/ </code></pre>
