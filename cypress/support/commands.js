const inboxUrl = Cypress.env('inboxUrl')
const token  = Cypress.env('api_token')

Cypress.Commands.add('getLastEmail', () => {
    function requestEmail() {
      return cy
        .request({
          method: 'GET',
          url: `${inboxUrl}/messages`,
          headers: {
            'api_token': token,
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
                'api_token': token,
            },
            json: true,
            }).then(({ body }) => { 
                if (body) { return body }

                cy.wait(1000);  
                return requestEmail();
            })
          }
        });
    }
  
    return requestEmail();
  });
