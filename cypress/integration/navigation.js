describe.skip('Checking expected side nav', () => {

    it('Lets close the tooltips before we continue', () => {
        cy.visit('/')
        cy.get('.introjs-skipbutton')
            .click()

    })

    it('Checking we have the header and 5 buttons', () => {
        cy.get('#header')
            .find('i')
            .should('exist')
            .and('have.length.gt', 5)

    })

    // click the toggler button to expand nav and then close it again

    it('Lets click the toggler button', () => {
        cy.get('#header')
            .find('#header-toggle')
            .click()
            .should('have.class', 'uil-multiply')
            .click()
            .should('not.have.class', 'uil-multiply')
    })

    // lets click toggler to expand nav and check some links

    it('Lets click the toggler button and leave it open to check links', () => {
        cy.get('#header')
            .find('#header-toggle')
            .click()
            .should('have.class', 'uil-multiply')
    })

    it('Lets check the home link', () => {
        cy.get('#nav-bar')
            .should('have.class', 'sidebar show')
            .find('i')
            .eq(0)
            .should('have.class', 'nav_logo-icon')
            .get('#nav-bar')
            .find('a')
            .eq(0)
            .should('have.attr', 'href', 'index.html')
    })

    it('Lets check the feedback link', () => {
        cy.get('#nav-bar')
            .should('have.class', 'sidebar show')
            .find('i')
            .eq(9)
            .should('have.class', 'uil-comment-message')
            .get('#nav-bar')
            .find('a')
            .eq(13)
            .should('have.attr', 'href', 'feedback.html')
            
    })

    it('Lets check the about link', () => {
        cy.get('#nav-bar')
            .should('have.class', 'sidebar show')
            .find('i')
            .eq(10)
            .should('have.class', 'uil-info-circle')
            .get('#nav-bar')
            .find('a')
            .eq(14)
            .should('have.attr', 'href', 'about.html')
            
    })

    // lets check we have 6 layers for the world

    it('Lets check we have Jetstream', () => {
        cy.get('#nav-bar')
            .should('have.class', 'sidebar show')
            .find('i')
            .eq(1)
            .should('have.class', 'uil-windsock')
    })

    it('Lets check we have Precipitation', () => {
        cy.get('#nav-bar')
            .should('have.class', 'sidebar show')
            .find('i')
            .eq(2)
            .should('have.class', 'uil-cloud-showers-alt')
    })

    it('Lets check we have Surface', () => {
        cy.get('#nav-bar')
            .should('have.class', 'sidebar show')
            .find('i')
            .eq(3)
            .should('have.class', 'uil-mountains-sun')
    })

    it('Lets check we have Vegetation', () => {
        cy.get('#nav-bar')
            .should('have.class', 'sidebar show')
            .find('i')
            .eq(4)
            .should('have.class', 'uil-trees')
    })

    it('Lets check we have SST', () => {
        cy.get('#nav-bar')
            .should('have.class', 'sidebar show')
            .find('i')
            .eq(5)
            .should('have.class', 'uil-temperature-three-quarter')
    })

    it('Lets check we have Currents', () => {
        cy.get('#nav-bar')
            .should('have.class', 'sidebar show')
            .find('i')
            .eq(6)
            .should('have.class', 'uil-wind')
    })

    // check the collections folder navigation

    it('Lets check we have the collections folder and click to expand it', () => {
        cy.get('#nav-bar')
            .should('have.class', 'sidebar show')
            .find('i')
            .eq(7)
            .should('have.class', 'uil-folder-open')
            .click()
            .get('#menu_item1')
            .should('have.class', 'submenu collapse show')

    })

    // now check links in dropdown folder navigation


    it('Lets check we have the Last 540 Million Years', () => {
        cy.get('#menu_item1')
            .should('have.class', 'submenu collapse show')
            .get('li')
            .contains('Last 540 Million Years', { matchCase: false })
            .should('have.id', 'phanCollectionButton')

    })

    it('Lets check we have the Next 80 Years', () => {
        cy.get('#menu_item1')
            .should('have.class', 'submenu collapse show')
            .get('li')
            .contains('Next 80 Years', { matchCase: false })
            .should('have.id', 'COP26CollectionButton')
            .get('#menu_item1')
            .find('a')
            .eq(1)
            .should('have.attr', 'href', 'cop26.html')
               

    })

    it('Lets check we have the Next Million Years', () => {
        cy.get('#menu_item1')
            .should('have.class', 'submenu collapse show')
            .get('li')
            .contains('Next Million Years', { matchCase: false })
            .should('have.id', 'NextMillionCollectionButton')
            .get('#menu_item1')
            .find('a')
            .eq(2)
            .should('have.attr', 'href', 'nextMillion.html')

    })

    it('Lets check we have Dune (Arrakis)', () => {
        cy.get('#menu_item1')
            .should('have.class', 'submenu collapse show')
            .get('li')
            .contains('Dune (Arrakis)', { matchCase: false })
            .should('have.id', 'DuneCollectionButton')
            .get('#menu_item1')
            .find('a')
            .eq(3)
            .should('have.attr', 'href', 'dune.html')

    })

    it('Lets check we have the Wheel of Time', () => {
        cy.get('#menu_item1')
            .should('have.class', 'submenu collapse show')
            .get('li')
            .contains('Wheel of Time', { matchCase: false })
            .should('have.id', 'WoTCollectionButton')
            .get('#menu_item1')
            .find('a')
            .eq(4)
            .should('have.attr', 'href', 'wot.html')

    })

});