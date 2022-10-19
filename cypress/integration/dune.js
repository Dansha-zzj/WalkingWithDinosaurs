describe('Checking expected dune page content', () => {

    

    it('Visit the page first and check the title', () => {
        cy.visit('/dune.html')
        cy.title()
            .should('eq', 'climatearchive | Dune')

    })

    // hopefully the tooltips have loaded...lets check

    it('Tooltips pop-up dialogue test', () => {
        cy.get('.introjs-tooltip')
            .should('be.visible')
        cy.get('.introjs-tooltip-title')
            .should('include.text', 'Welcome to the climatearchive!')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'This website')
        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()

        cy.get('.introjs-tooltip-title')
            .should('include.text', 'This is Arrakis!')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'You can change')

        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()

        cy.get('.introjs-tooltiptext')
            .should('include.text', 'The toolbar on the left')

        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()

        cy.get('.introjs-tooltip-title')
            .should('include.text', 'These are the model layers!')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'Mix and match')

        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()

        cy.get('.introjs-tooltip-title')
            .should('include.text', 'These are the time controls!')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'You can loop')

        cy.get('.introjs-tooltipbuttons')
            .find('a')
            .contains('Next', { matchCase: false })
            .click()

        cy.get('.introjs-tooltip-title')
            .should('include.text', 'You\'ve made it!')
        cy.get('.introjs-tooltiptext')
            .should('include.text', 'Start exploring Arrakis now')

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

    it('Lets check the precipitation', () => {
        cy.get('.title')
            .eq(1)
            .should('include.text', 'precipitation')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-1')
            .should('include.text', 'precip min [mm/day]')
        cy.get('#lil-gui-name-2')
            .should('include.text', 'precip max [mm/day]')

    })

    it('Lets check the height clouds', () => {
        cy.get('.title')
            .eq(2)
            .should('include.text', 'clouds')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-3')
            .should('include.text', 'cloud cover min [fraction]')
        cy.get('#lil-gui-name-4')
            .should('include.text', 'cloud cover max [fraction]')

    })

    it('Lets check the surface winds', () => {
        cy.get('.title')
            .eq(3)
            .should('include.text', 'surface winds')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-5')
            .should('include.text', 'animation speed')
        cy.get('#lil-gui-name-6')
            .should('include.text', 'reference speed [m/s]')
        cy.get('#lil-gui-name-7')
            .should('include.text', 'number of arrows')
        cy.get('#lil-gui-name-8')
            .should('include.text', 'size of arrows')
        cy.get('#lil-gui-name-9')
            .should('include.text', 'scale by magnitude')
        cy.get('#lil-gui-name-10')
            .should('include.text', 'color by magnitude')

    })

    it('Lets check the surface temperature', () => {
        cy.get('.title')
            .eq(4)
            .should('include.text', 'surface temperature')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-11')
            .should('include.text', 'temp min [°C]')
        cy.get('#lil-gui-name-12')
            .should('include.text', 'temp max [°C]')

    })

    it('Lets check the height displacement', () => {
        cy.get('.title')
            .eq(5)
            .should('include.text', 'height displacement')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-13')
            .should('include.text', 'surface height diplacement')
        cy.get('#lil-gui-name-14')
            .should('include.text', 'dune height displacement')

    })

});