describe('Compare auxilary page screenshots', () => {

    it('About page screenshot', () => {
        cy.visit('/about.html')
        cy.get("#about")
        cy.comparePage('about-page')
    })

    it('Feedback page screenshot', () => {
        cy.visit('/feedback.html')
        cy.comparePage('feedback-page')
    })

});
