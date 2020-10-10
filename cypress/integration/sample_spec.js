const faker = require('faker');
const randomEmail = faker.internet.email().toLowerCase();

describe('Login Test', () => {

    it('Visits the test page', () => {
      cy.visit('http://localhost:3000')
      cy.contains('Sign in').click()
      cy.url().should('include', '/api/auth/signin')

      cy.get('#input-email-for-email-provider')
        .type(randomEmail)
        .should('have.value', randomEmail)
    
        cy.contains('Sign in with Email').click()
        cy.contains('Check your email')
        
    });

    it('should send an email containing a verification link', () => {
        const inboxUrl = Cypress.env('inboxUrl')
        const token  = Cypress.env('api_token')

        cy.getLastEmail().then(html => {
     
          const link = html.match(/href="([^"]*)/)[1]
          cy.expect(link).to.contains('/api/auth/callback/email')
          cy.visit(link);
          cy.contains(`Signed in as ${randomEmail}`)
          cy.reload()
          cy.contains(`Signed in as ${randomEmail}`)
          cy.request({
            method: 'PATCH',
            url: `${inboxUrl}/clean`,
            headers: {
                'api_token': token,
                }
            });
        });
      });
  })

