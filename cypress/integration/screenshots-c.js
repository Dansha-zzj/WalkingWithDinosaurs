describe('Compare fantasy screenshots', () => {

    it.skip('Dune page screenshot', () => {
        cy.visit('/dune.html')
        cy.compareExtraLongGlobeAnimation('dune-page')
    })

    it.skip('Wot page screenshot', () => {
        cy.visit('/wot.html')
        cy.compareExtraLongGlobeAnimation('wot-page')
    })

});