describe('Compare key pages screenshots', () => {

    it.skip('Home page screenshot', () => {
        cy.visit('/')
        cy.compareExtraLongGlobeAnimation('home-page')
    })

    it.skip('Cop26 page screenshot', () => {
        cy.visit('/cop26.html')
        cy.compareGlobeAnimation('cop26-page')
    })

    it.skip('NextMillion page screenshot', () => {
        cy.visit('/nextMillion.html')
        cy.compareExtraLongGlobeAnimation('nextmillion-page')
    })

});