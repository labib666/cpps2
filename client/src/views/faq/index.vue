<template lang="pug">
block content
    block content
    .row.align-items-center#fill-view
        .col
        h3.text-center Frequently Asked Questions

        .list-group
            .list-group-item
            div
                h4.list-group-item-heading Is everything on this site 100% accurate

                p.list-group-item-text Of course not. The contents are provided by human, so there is bound to be errors. Some of the codes we have given are not even tested. Same goes for the hints. Do not assume everything you read to be true/correct. Use your own judgment and logic to decide whether the facts given on the site is right or wrong. If you spot any mistake, please report the <router-link class="link" to='/bugs'>bug</router-link>.

            .list-group-item
            div
                h4.list-group-item-heading Why isn't there any comment/forum section? I want to discuss stuffs.

                p.list-group-item-text There are already plenty of places to discuss stuffs. Creating another location will simply dilute the whole thing.
                p.list-group-item-text If you have any question about any particular problem, then it is better to go its corresponding online judge and discuss it on their forum.
                p.list-group-item-text If you have question about some article on this site unrelated to any online judge, then please find some other place ( facebook group, codeforces, topcoder, codechef ) to discuss them.
                p.list-group-item-text If you want to discuss technical stuffs like mistakes in artcle/code, broken link/css or any kind of bugs, then we have <a class="link" target="_blank" href='https://github.com/labib666/cpps2/issues'>Github</a> for that.

            .list-group-item
            div
                h4.list-group-item-heading I didn't understand the article on topic X. What should I do?

                p.list-group-item-text Google to find other resources on topic X. There are plenty of resource over net. If you are unable to find any satisfactory result, then try asking questions on forums/sites like stackoverflow, codeforces, topcoder and etc.

            .list-group-item
            div
                h4.list-group-item-heading It will be really cool to have the feature X. Can you implement it?

                p.list-group-item-text Depends. Feel free to request the feature by raising an issue on <a class="link" target="_blank" href='https://github.com/labib666/cpps2/issues'>Github</a>. We can discuss about feasibility, relevance and implementation of the issue there and come to a conclusion.

            .list-group-item
            div
                h4.list-group-item-heading This FAQ isn't enough. I have more questions.

                p.list-group-item-text Raise an issue on <a class="link" target="_blank" href='https://github.com/labib666/cpps2/issues'>Github</a> with a question tag. I will try to answer there.

</template>

<style rel="stylesheet/scss" lang="scss">
.link {
    color:blue;
}
.row {
    padding: 5%;
}
</style>


<script>
export default {}
</script>
