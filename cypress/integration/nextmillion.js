describe('Checking expected nextmillion page content', () => {

    

    it('Visit the page first and check the title', () => {
        cy.visit('/nextMillion.html')
        cy.title()
            .should('eq', 'climatearchive | The Next Million Years')

    })

    // hopefully the tooltips have loaded...lets check

    it('Tooltips pop-up dialogue test', () => {
        cy.get('.introjs-tooltip')
            .should('be.visible')
        cy.get('.introjs-tooltip-title')
            .should('include.text', 'Next Million Years')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'This page shows')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()

        cy.get('.introjs-tooltip-title')
            .should('include.text', 'Changing Time')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'Click anywhere on')

        // now close the tooltip box using the done button
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Done', { matchCase: false })
            .click()

        // check its gone
        cy.get('.introjs-tooltipReferenceLayer')
            .should('not.exist')

    })

    // now the tooltips are closed, lets check the controls...

    it('Lets check we have controls', () => {
        cy.get('.title')
            .eq(0)
            .should('include.text', 'Open Controls')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

    })

    it('Lets check the temperature anomaly', () => {
        cy.get('.title')
            .eq(1)
            .should('include.text', 'temperature anomaly')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-1')
            .should('include.text', 'temp min [°C]')
        cy.get('#lil-gui-name-2')
            .should('include.text', 'temp max [°C]')

    })

    it('Lets check the height displacement', () => {
        cy.get('.title')
            .eq(2)
            .should('include.text', 'height displacement')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-3')
            .should('include.text', 'surface height diplacement')

    })

});