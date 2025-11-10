import SessionManager from "../utils/SessionManager";

export default class FetchHelper {
    static async makeRequest(path, method, headers = {}, body = null) {
        try{
            // Only include body for methods that allow it
            const methodsWithBody = ["POST", "PUT", "PATCH", "DELETE"];
            let requestBody = null;
            if (body && methodsWithBody.includes(method.toUpperCase())) {
                requestBody = JSON.stringify(body);
            }

            // Calculate upload size in bytes
            const requestHeaderSize = headers ? new TextEncoder().encode(JSON.stringify(headers)).length : 0;
            const requestBodySize = requestBody ? new TextEncoder().encode(requestBody).length : 0;
            const requestSize = requestHeaderSize + requestBodySize;

            // Track upload usage
            const uploadUsageManager = new SessionManager("networkUploadUsage");
            const uploadSizeHistory = Number(await uploadUsageManager.getToken());
            await uploadUsageManager.setToken(String(uploadSizeHistory + requestSize));

            // Perform the fetch request
            const response = await fetch(path, {
                method,
                headers,
                body: requestBody,
            });

            // Track download usage
            const responseClone = response.clone(); // clone to avoid consuming original response
            const responseText = await responseClone.text();
            const responseSize = responseText ? new TextEncoder().encode(responseText).length : 0;

            const downloadUsageManager = new SessionManager("networkDownloadUsage");
            const downloadSizeHistory = Number(await downloadUsageManager.getToken());
            await downloadUsageManager.setToken(String(downloadSizeHistory + responseSize));
            
            return response; // original response is still readable by caller
        }
        catch (error) {
            console.log(`Error during request making: ${error}`)
        }
    }
}
