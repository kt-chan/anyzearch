// handler.js
// NOT RECOMMENDED: We're using an external module here for demonstration purposes
// this would be a module we bundled with our custom agent skill and would be located in the same folder as our handler.js file
// Do not require modules outside of the plugin folder. It is recommended to use require within a function scope instead of the global scope.
// const _ExternalApiCaller = require('./external-api-caller.js');

module.exports.runtime = {
    handler: async function ({ instruction }) {
        const callerId = `${this.config.name}-v${this.config.version}`;
        const langflow_hostpath = this.runtimeArgs["LANGFLOW_HOST_PATH"];
        const langflow_apk_key = this.runtimeArgs["LANGFLOW_API_KEY"];
        const session_id = this._getCurrentDateTime();
        const basequery = new URL("8ecb7e3e-b9d0-4a39-9a7b-50d1fad35b58?stream=false", langflow_hostpath).href;
       
        try {
            this.introspect(
                `${callerId} called with enquiry:${instruction}...`
            );

            const requestBody = {
                input_value: instruction,
                session_id: session_id
            };

            // Make the POST request using fetch
            const response = await fetch(basequery, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": langflow_apk_key
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            return JSON.stringify({ data });
        } catch (e) {
            this.introspect(
                `${callerId} failed to invoke with enquiry:${instruction}`
            );
            this.logger(
                `${callerId} failed to invoke with enquiry:${instruction}`,
                e.message
            );
            return `The tool failed to run for some reason. Here is all we know ${e.message}`;
        }
    },

    // Recommended: Use this method to call external APIs or services
    // by requiring the module in the function scope and only if the code execution reaches that line
    // this is to prevent any unforseen issues with the global scope and module loading/unloading.
    // This file should be placed in the same folder as your handler.js file.
    _doExternalApiCall(myProp) {
        const _ScopedExternalCaller = require("./external-api-caller.js");
        return _ScopedExternalCaller.doSomething(myProp);
    },

    _getCurrentDateTime() {
        const now = new Date(); // 获取当前日期和时间

        // 获取年、月、日
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
        const day = String(now.getDate()).padStart(2, '0');

        // 获取小时、分钟、秒
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // 拼接为 yyyy-mm-dd_hh:mm:ss 格式
        const formattedDateTime = `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`;
        return formattedDateTime;
    }
}