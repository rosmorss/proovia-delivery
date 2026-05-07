/* ========================= */
/* REVEAL ANIMATION */
/* ========================= */

const revealCards = document.querySelectorAll(".terms-card");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }

    });

},{
    threshold: 0.15
});

revealCards.forEach(card => {
    observer.observe(card);
});

/* ========================= */
/* SMOOTH SIDEBAR LINKS */
/* ========================= */

const sidebarLinks = document.querySelectorAll(".sidebar-card a");

sidebarLinks.forEach(link => {

    link.addEventListener("click", (e) => {

        e.preventDefault();

        const target = document.querySelector(
            link.getAttribute("href")
        );

        target.scrollIntoView({
            behavior: "smooth"
        });

    });

});

/* ========================= */
/* HERO PARALLAX */
/* ========================= */

window.addEventListener("mousemove", (e) => {

    const glow1 = document.querySelector(".glow-1");
    const glow2 = document.querySelector(".glow-2");

    let x = e.clientX / window.innerWidth;
    let y = e.clientY / window.innerHeight;

    glow1.style.transform =
        `translate(${x * 40}px, ${y * 40}px)`;

    glow2.style.transform =
        `translate(${-x * 40}px, ${-y * 40}px)`;

});

/* ========================= */
/* ACTIVE SIDEBAR LINK */
/* ========================= */

window.addEventListener("scroll", () => {

    let sections = document.querySelectorAll(".terms-card");

    sections.forEach(section => {

        let top = window.scrollY;
        let offset = section.offsetTop - 200;
        let height = section.offsetHeight;
        let id = section.getAttribute("id");

        if(top >= offset && top < offset + height){

            sidebarLinks.forEach(link => {
                link.classList.remove("active");
            });

            const activeLink = document.querySelector(
                `.sidebar-card a[href="#${id}"]`
            );

            if(activeLink){
                activeLink.classList.add("active");
            }
        }

    });

});

