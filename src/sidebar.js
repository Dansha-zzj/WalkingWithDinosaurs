// event listener to toggle sidebar
// https://bbbootstrap.com/snippets/bootstrap-5-sidebar-menu-toggle-button-34132202

async function initSidebar() {

    document.addEventListener("DOMContentLoaded", function(event) {

        const showNavbar = (toggleId, navId, bodyId, headerId, timeID, navheaderID, csvID) =>{
            
        const toggle = document.getElementById(toggleId),
        nav = document.getElementById(navId),
        bodypd = document.getElementById(bodyId),
        timepd = document.getElementsByClassName(timeID),
        headerpd = document.getElementById(headerId),
        navheaderpd = document.getElementsByClassName(navheaderID),
        csvpd = document.getElementsByClassName(csvID)


        // Validate that all variables exist
        if(toggle && nav && bodypd && headerpd){
        toggle.addEventListener('click', ()=>{
        // show navbar
        nav.classList.toggle('show')
        // change icon
        toggle.classList.toggle('uil-multiply')
        // add padding to body
        bodypd.classList.toggle('container-fluid-pd')
        // add padding to header
        headerpd.classList.toggle('header-pd')
        // add padding to time controls
        timepd[0].classList.toggle('timeRow-pd')
        // add padding to csv textarea
        if (csvpd.length > 0) {

            if (csvpd[0].classList.contains('col-lg-5')) {
                csvpd[0].classList.remove('col-lg-5');
                csvpd[0].classList.add('col-lg-7');
            } else {
                csvpd[0].classList.remove('col-lg-7');
                csvpd[0].classList.add('col-lg-5');        
            }
            csvpd[0].classList.toggle('userCSVInputField-pd')

        }

        // change navbar header
        navheaderpd[0].classList.toggle('navbar-header-pd')
        navheaderpd[1].classList.toggle('navbar-header-pd')
        })
        }
        }
        
        showNavbar('header-toggle','nav-bar','container-fluid','header','timeRow','navbar-header','userCSVInputField')
        
    });

}

export { initSidebar };