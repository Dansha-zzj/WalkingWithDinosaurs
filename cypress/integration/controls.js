describe.skip('Checking expected controls nav', () => {

    it('Lets close the tooltips before we continue', () => {
        cy.visit('/');
        cy.get('.introjs-skipbutton')
            .click();

    });

    it('Lets check we have controls', () => {
        cy.get('.title')
            .eq(0)
            .should('include.text', 'Open Controls')
            .click()
            .should('have.attr', 'aria-expanded', 'true');

    });

    it('Lets check the jetstream layer', () => {
        cy.get('.title')
            .eq(1)
            .should('include.text', 'jet stream layer (200hPa winds)')
            .click()
            .should('have.attr', 'aria-expanded', 'true');

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-1')
            .should('include.text', 'animation speed');
        cy.get('#lil-gui-name-2')
            .should('include.text', 'minimum speed [m/s]');
        cy.get('#lil-gui-name-3')
            .should('include.text', 'reference speed [m/s]');
        cy.get('#lil-gui-name-4')
            .should('include.text', 'number of arrows');
        cy.get('#lil-gui-name-5')
            .should('include.text', 'size of arrows');
        cy.get('#lil-gui-name-6')
            .should('include.text', 'scale by magnitude');
        cy.get('#lil-gui-name-7')
            .should('include.text', 'color by magnitude');

    });

    it('Lets check the precipitation layer', () => {
        cy.get('.title')
            .eq(2)
            .should('include.text', 'precipitation layer')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-8')
            .should('include.text', 'precip min [mm/day]')
        cy.get('#lil-gui-name-9')
            .should('include.text', 'precip max [mm/day]')

    })

    it('Lets check the surface layer', () => {
        cy.get('.title')
            .eq(3)
            .should('include.text', 'surface layer')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-10')
            .should('include.text', 'paleogeography')
        cy.get('#lil-gui-name-11')
            .should('include.text', 'height diplacement')

    })

    it('Lets check the vegetation layer', () => {
        cy.get('.title')
            .eq(4)
            .should('include.text', 'vegetation layer')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-12')
            .should('include.text', 'number of trees')
        cy.get('#lil-gui-name-13')
            .should('include.text', 'size of trees')

    })

    it('Lets check the ocean layer', () => {
        cy.get('.title')
            .eq(5)
            .should('include.text', 'ocean layer')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-14')
            .should('include.text', 'SST min [°C]')
        cy.get('#lil-gui-name-15')
            .should('include.text', 'SST max [°C]')
        cy.get('#lil-gui-name-16')
            .should('include.text', 'show sea ice')

    })

    it('Lets check the ocean currents layer', () => {
        cy.get('.title')
            .eq(6)
            .should('include.text', 'ocean currents layer')
            .click()
            .should('have.attr', 'aria-expanded', 'true')

        /* 
        check we have the child element controls. 
        if aria-expanded above was false, this next test would fail because it would be hidden. 
        */

        cy.get('#lil-gui-name-17')
            .should('include.text', 'animation speed')
        cy.get('#lil-gui-name-18')
            .should('include.text', 'reference speed [cm/s]')
        cy.get('#lil-gui-name-19')
            .should('include.text', 'number of arrows')
        cy.get('#lil-gui-name-20')
            .should('include.text', 'size of arrows')
        cy.get('#lil-gui-name-21')
            .should('include.text', 'scale by magnitude')
        cy.get('#lil-gui-name-22')
            .should('include.text', 'color by magnitude')

    })

});