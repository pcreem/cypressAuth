const inboxUrl = Cypress.env('inboxUrl')
const token  = Cypress.env('Api-Token')

Cypress.Commands.add('getLastEmail', () => {
    function requestEmail() {
      return cy
        .request({
          method: 'GET',
          url: `${inboxUrl}/messages`,
          headers: {
            'Api-Token': token,
          },
          json: true,
        })
        .then(({ body }) => {
   
          if (body) {
            
            let msgId = body[0].id
            cy.request({
            method: 'GET',
            url: `${inboxUrl}/messages/${msgId}/body.html`,
            headers: {
                'Api-Token': token,
            },
            json: true,
            }).then(({ body }) => { 
                if (body) { return body }
                 // If body is null, it means that no email was fetched for this address.
                // We call requestEmail recursively until an email is fetched.
                // We also wait for 300ms between each call to avoid spamming our server with requests
                cy.wait(1000);  
                return requestEmail();
        
            })
        
          }

        });
    }
  
    return requestEmail();
  });
