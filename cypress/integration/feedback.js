describe('Checking expected feedback page content', () => {

    it('Visit the page first and check the title', () => {
        cy.visit('/feedback.html')
        cy.title()
            .should('include', 'feedback')

    })

    it('We should have an iframe', () => {
        cy.get('iframe').should('be.visible')
        
    })

});