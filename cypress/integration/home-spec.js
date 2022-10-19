describe('Checking expected home page content', () => {

    beforeEach(() => {
        cy.visit('/');
    });

    it('The homepage has a title tag with expected text', () => {
        cy.title()
            .should('eq', 'climatearchive | Phanerozoic')
    })

});