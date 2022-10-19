describe('Checking expected about page content', () => {

    beforeEach(() => {
        cy.visit('/about.html');
    });

    it('Does the about page have a title tag with expected text', () => {
        cy.title()
            .should('include', 'about')

    })

    it('Do we have a main heading', () => {
        cy.get('.mainHeading')
            .should('include.text', 'climatearchive.org')

    })

    it('Do we have some subheadings', () => {
        cy.get('.subHeading')
            .should('have.length', 5)

        cy.get('.subHeading')
            .eq(0)
            .should('include.text', 'The Application')

        cy.get('.subHeading')
            .eq(1)
            .should('include.text', 'Contributors')

        cy.get('.subHeading')
            .eq(2)
            .should('include.text', 'Credits')

        cy.get('.subHeading')
            .eq(3)
            .should('include.text', 'Data Sources')

        cy.get('.subHeading')
            .eq(4)
            .should('include.text', 'Funding')

    })

    it('Do we have some funding links', () => {
        cy.get('#about')
            .find('a')
            .contains('Jean Golding Institute', { matchCase: false })
            .should('have.attr', 'href', 'http://www.bristol.ac.uk/golding/')

        cy.get('#about')
            .find('a')
            .contains('Cabot Institute for the Environment', { matchCase: false })
            .should('have.attr', 'href', 'http://www.bristol.ac.uk/cabot/')

        cy.get('#about')
            .find('a')
            .contains('School of Geographical Sciences', { matchCase: false })
            .should('have.attr', 'href', 'http://www.bristol.ac.uk/geography/')

    })

    it('Do we have some footer logos and links', () => {
        cy.get('#about')
            .find('.thumbnail')
            .should('have.length', 3)

        cy.get('#about')
            .find('.thumbnail')
            .eq(0)
            .should('have.attr', 'href', 'http://www.bristol.ac.uk/golding/')
            .find('img')
            .should('have.attr', 'src', 'images/JGI-visual.png')
            .and('have.id', 'JGILogo')

        cy.get('#about')
            .find('.thumbnail')
            .eq(1)
            .should('have.attr', 'href', 'http://www.bristol.ac.uk/cabot/')
            .find('img')
            .should('have.attr', 'src', 'images/cabot-banner.jpg')
            .and('have.id', 'cabotLogo')

        cy.get('#about')
            .find('.thumbnail')
            .eq(2)
            .should('have.attr', 'href', 'https://www.bristol.ac.uk/geography/')
            .find('img')
            .should('have.attr', 'src', 'images/UOB-visual.png')
            .and('have.id', 'UoBLogo')

    })

    it('Do we have a contact email and twitter for seb', () => {
        cy.get('#about')
            .find('a')
            .contains('sebastian.steinig@bristol.ac.uk', { matchCase: false })
            .should('have.attr', 'href', 'mailto:sebastian.steinig@bristol.ac.uk')

        cy.get('#about')
            .find('a')
            .contains('@sebsteinig', { matchCase: false })
            .should('have.attr', 'href', 'https://twitter.com/sebsteinig')

    })

    it('Do we have the contributors', () => {
        cy.get('#about')
            .should('include.text', 'Sebastian Steinig')
            .find('a')
            .contains('Sebastian Steinig', { matchCase: false })
            .should('have.attr', 'href', 'https://www.bristol.ac.uk/people/person/Sebastian-Steinig-cb9bbc66-4b94-4c16-be2a-90cc5cf1afa0/')
        
        cy.get('#about')
            .should('include.text', 'Tessa Alexander')
            .find('a')
            .contains('Tessa Alexander', { matchCase: false })
            .should('have.attr', 'href', 'https://research-information.bris.ac.uk/en/persons/tessa-s-alexander')
        
        cy.get('#about')
            .should('include.text', 'Zak Duggan')
            .should('include.text', 'Patrick Lee')
            .should('include.text', 'Jakub Navratil')
            .should('include.text', 'Ikenna Offokansi')
            .should('include.text', 'Matthew Swann')

    })

    it('Credit links', () => {
        cy.get('#about')
            .find('a')
            .contains('earth', { matchCase: false })
            .should('have.attr', 'href', 'https://earth.nullschool.net')

        cy.get('#about')
            .find('a')
            .contains('Cameron Beccario', { matchCase: false })
            .should('have.attr', 'href', 'https://twitter.com/cambecc?lang=en')

        cy.get('#about')
            .find('a')
            .contains('WebGL weather globe', { matchCase: false })
            .should('have.attr', 'href', 'https://blog.mbq.me/webgl-weather-globe/')

        cy.get('#about')
            .find('a')
            .contains('Miron Kursa', { matchCase: false })
            .should('have.attr', 'href', 'https://mbq.me')

        cy.get('#about')
            .find('a')
            .contains('How I built a wind map with WebGL', { matchCase: false })
            .should('have.attr', 'href', 'https://blog.mapbox.com/how-i-built-a-wind-map-with-webgl-b63022b5537f')

        cy.get('#about')
            .find('a')
            .contains('Vladimir Agafonkin', { matchCase: false })
            .should('have.attr', 'href', 'https://medium.com/@agafonkin')

        cy.get('#about')
            .find('a')
            .contains('UW-Macrostrat/geo-timescale', { matchCase: false })
            .should('have.attr', 'href', 'https://github.com/UW-Macrostrat/geo-timescale')

        cy.get('#about')
            .find('a')
            .contains('UW-Madison Macrostrat', { matchCase: false })
            .should('have.attr', 'href', 'https://macrostrat.org')

        cy.get('#about')
            .find('a')
            .contains('Jules Blom', { matchCase: false })
            .should('have.attr', 'href', 'https://twitter.com/Mega_Jules')

        cy.get('#about')
            .find('a')
            .contains('three.js', { matchCase: false })
            .should('have.attr', 'href', 'https://threejs.org')

        cy.get('#about')
            .find('a')
            .contains('D3.js', { matchCase: false })
            .should('have.attr', 'href', 'https://d3js.org')

        cy.get('#about')
            .find('a')
            .contains('Ed Hawkins', { matchCase: false })
            .should('have.attr', 'href', 'https://twitter.com/ed_hawkins')

        cy.get('#about')
            .find('a')
            .contains('xadilzeshan¥', { matchCase: false })
            .should('have.attr', 'href', 'https://github.com/adilzeshan/warming-stripes')

        cy.get('#about')
            .find('a')
            .contains('Bootstrap', { matchCase: false })
            .should('have.attr', 'href', 'https://getbootstrap.com')

        cy.get('#about')
            .find('a')
            .contains('Hyper Theme', { matchCase: false })
            .should('have.attr', 'href', 'https://themes.getbootstrap.com/product/hyper-responsive-admin-dashboard-template/')

        cy.get('#about')
            .find('a')
            .contains('GreenSock', { matchCase: false })
            .should('have.attr', 'href', 'https://greensock.com')

        cy.get('#about')
            .find('a')
            .contains('Unicons', { matchCase: false })
            .should('have.attr', 'href', 'https://iconscout.com/unicons')

    })

    it('Do we have the data sources', () => {
        cy.get('#about')
            .find('a')
            .contains('Valdes et al. (2021)', { matchCase: false })
            .should('have.attr', 'href', 'https://cp.copernicus.org/articles/17/1483/2021/')

        cy.get('#about')
            .find('a')
            .contains('BRIDGE group', { matchCase: false })
            .should('have.attr', 'href', 'https://www.bristol.ac.uk/geography/research/bridge/')

        cy.get('#about')
            .find('a')
            .contains('Scotese and Wright (2018)', { matchCase: false })
            .should('have.attr', 'href', 'https://www.earthbyte.org/paleodem-resource-scotese-and-wright-2018/')

        cy.get('#about')
            .find('a')
            .contains('The Conversation', { matchCase: false })
            .should('have.attr', 'href', 'https://theconversation.com/dune-we-simulated-the-desert-planet-of-arrakis-to-see-if-humans-could-survive-there-170181')

        cy.get('#about')
            .find('a')
            .contains('Alex Farnsworth', { matchCase: false })
            .should('have.attr', 'href', 'https://research-information.bris.ac.uk/en/persons/alexander-j-farnsworth')

        cy.get('#about')
            .find('a')
            .contains('Emily Ball', { matchCase: false })
            .should('have.attr', 'href', 'https://research-information.bris.ac.uk/en/persons/emily-ball')

        cy.get('#about')
            .find('a')
            .contains('Svensk Kärnbränslehantering AB', { matchCase: false })
            .should('have.attr', 'href', 'https://www.paleo.bristol.ac.uk/~ggdjl/reports/TR-19-09.pdf')

        cy.get('#about')
            .find('a')
            .contains('Natalie Lord', { matchCase: false })
            .should('have.attr', 'href', 'https://www.bristol.ac.uk/people/person/Natalie-Lord-08493433-1aba-4e31-b015-77b6d23fc242/')

        cy.get('#about')
            .find('a')
            .contains('Dan Lunt', { matchCase: false })
            .should('have.attr', 'href', 'https://www.bristol.ac.uk/people/person/Dan-Lunt-f54ac388-22de-4fbd-9f8d-0b3b66293a83/')

    })

    it('Lets click the close button', () => {
        cy.get('#closeButton')
            .click()
        cy.url().should('include', '/')

    })

});