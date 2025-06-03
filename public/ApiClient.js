// Class that contains request operations for get, post, put, patch and delete
export class ApiClient {  
    constructor(baseUrl) {       // Constructor gets base url for client
        this.baseUrl = baseUrl;
    }

    queryResults = document.getElementById("response");  // Get text area to output response

    // Delete request, asynchronous method
    async  delete(id) {

        let url = this.baseUrl + `/${id}`;  // Get record id

        try {
            await fetch(url, {         // Request delete
                method: 'DELETE',
            })
            .then(response => {                                                                     // response returned from fetch
                if (!response.ok) {                                                                 // HTTP request failed
                    this.queryResults.value = 'HTTP DELETE request error: Status = ' + response.status.toString(); // log failure to Result output                                                  // Check for request error
                    throw new Error('HTTP request failed: Status = ' + response.status.toString()); // Throw error POST,PUT or PATCH request failed
                }})

            this.queryResults.value = 'Deleted record number ' +  `${id}`;   // Send delete message to text area

          // Catch error, send to console, and throw
        } catch (error) {
            console.error('DELETE', error);
            throw error;
        }
    }

    // Get request, asynchronous method
    async get(id) {     // Pass id for specific record

            let url = this.baseUrl;    // Start with base url
            if (id) 
                url += `/${id}`;       // Add id for specific record, if id was passed
            
            try {
                await fetch(url)      // Request Get and return response
                        .then(response => {                                                                     // response returned from fetch
                            if (!response.ok) {                                                                 // HTTP request failed
                                this.queryResults.value = 'HTTP GET request error: Status = ' + response.status.toString(); // log failure to Result output                                                  // Check for request error
                                throw new Error('HTTP request failed: Status = ' + response.status.toString()); // Throw error stating that POST,PUT or PATCH request failed
                            }
                            return response;
                            })
                        .then((response) => response.json())   // Format response into json file and return file
                        .then((json) => this.queryResults.value = JSON.stringify(json, null, 2))  // Stringify json file and return
          
            // Catch error, send to console, then throw error  
            } catch (error) {
                console.error('GET', error);
                throw error;
            }
    }

    // Post, Put and Patch requests, asynchronous method
    // jsonFields: all fields with data for current method
    // thisMethod: current method for this request (post, put or patch)
    // ID: id of the record for put or patch request
    async postPutPatch(jsonFields, thisMethod, id) {

            try {
                let url = this.baseUrl;     // Start with base url
                if (id) 
                    url += `/${id}`;      // Add id for specific record, if id was passed
                await fetch(url, {
                        method: thisMethod,    // Parameter: post, put or patch
                        body: JSON.stringify(jsonFields),   // Parameter: all fields in json format for post, put or patch
                        headers: {
                            'Content-type': 'application/json; charset=UTF-8',   // Request header
                        },
                        })
                        .then(response => {                                                                     // response returned from fetch
                            if (!response.ok) {                                                                 // HTTP request failed
                                this.queryResults.value = 'HTTP ' + thisMethod + ' request error: Status = ' + response.status.toString(); // log failure to Result output                                                   // Check for request error
                                throw new Error('HTTP request failed: Status = ' + response.status.toString()); // Throw error stating that POST,PUT or PATCH request failed
                            }
                            return response;
                            })
                        .then((response) => response.json())    // Format response into json file and return file
                        .then((json) => this.queryResults.value = JSON.stringify(json, null, 2));    // Stringify json file and return
            
            // Catch error, send to console, then throw error
            } catch (error) {
            console.error(thisMethod, error);
            throw error;
            }
    }
} 
