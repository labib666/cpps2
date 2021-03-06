import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
    {
        path: '/login',
        component: () => import('@/views/auth/login'),
        hidden: true,
        meta: { title: 'Login' },
    },
    {
        path: '/register',
        component: () => import('@/views/auth/register'),
        hidden: true,
        meta: { title: 'Register' },
    },
    {
        path: '/404',
        component: () => import('@/views/404'),
        hidden: true,
        meta: { title: '404' },
    },

    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        name: 'Dashboard',
        meta: { title: 'Home', icon: 'home' },
        children: [{
            path: 'dashboard',
            component: () => import('@/views/dashboard/index'),
            hidden: true,
        }],
    },
    // {
    //     path: '/example',
    //     component: Layout,
    //     redirect: '/example/table',
    //     name: 'Example',
    //     meta: { title: 'Example', icon: 'example' },
    //     children: [
    //         {
    //             path: 'table',
    //             name: 'Table',
    //             component: () => import('@/views/table/index'),
    //             meta: { title: 'Table', icon: 'table' },
    //         },
    //         {
    //             path: 'tree',
    //             name: 'Tree',
    //             component: () => import('@/views/tree/index'),
    //             meta: { title: 'Tree', icon: 'tree' },
    //         },
    //     ],
    // },
    // {
    //     path: '/form',
    //     component: Layout,
    //     children: [
    //         {
    //             path: 'index',
    //             name: 'Form',
    //             component: () => import('@/views/form/index'),
    //             meta: { title: 'Form', icon: 'form' },
    //         },
    //     ],
    // },
    {
        path: '/user',
        component: Layout,
        children: [
            {
                path: 'profile/:username',
                name: 'profile',
                component: () => import('@/views/users/index'),
                meta: { title: 'Profile', icon: 'user' },
                props: true,
            },
        ],
    },
    {
        path: '/gateway',
        component: Layout,
        children: [
            {
                path: `folder/000000000000000000000000`,
                name: 'gateway-root',
                component: () => import('@/views/gateway/index'),
                meta: { title: 'Gateway', icon: 'tree' },
                props: { folderId: `000000000000000000000000` },
            },
            {
                path: 'folder/:folderId',
                name: 'gateway',
                component: () => import('@/views/gateway/index'),
                meta: { title: 'Gateway', icon: 'tree' },
                props: true,
                hidden: true,
            },
        ],
    },
    {
        path: '/classrooms',
        component: Layout,
        children: [
            {
                path: '',
                name: 'classrooms',
                component: () => import('@/views/classrooms/index'),
                meta: { title: 'Classrooms', icon: 'group' },
                props: true,
            },
            {
                path: ':classroomId',
                name: 'classroom',
                component: () => import('@/views/classroom'),
                meta: { title: 'Classroom' },
                props: true,
                hidden: true,
            },
        ],
    },
    {
        path: '/problemlists',
        component: Layout,
        children: [
            {
                path: '',
                name: 'problemLists',
                component: () => import('@/views/problemLists/index'),
                meta: { title: 'Problem Lists', icon: 'list' },
                props: true,
            },
            {
                path: ':problemListId',
                name: 'problemList',
                component: () => import('@/views/problemList/index'),
                meta: { title: 'Problem List', icon: 'list' },
                props: true,
                hidden: true,
            },
        ],
    },
    {
        path: '/faq',
        component: Layout,
        children: [{
            path: '',
            name: 'faq',
            meta: { title: 'FAQ', icon: 'info' },
            component: () => import('@/views/faq/index'),
        }],
    },
    {
        path: '/bugs',
        component: Layout,
        children: [{
            path: '',
            name: 'bugs',
            meta: { title: 'Bugs & Hugs', icon: 'bug' },
            component: () => import('@/views/faq/bugs'),
        }],
    },
    {
        path: '/admin',
        component: Layout,
        adminOnly: true,
        children: [{
            path: '',
            name: 'admin',
            meta: { title: 'Admin', icon: 'lock' },
            component: () => import('@/views/admin/index'),
        }],
    },
    { path: '*', redirect: '/404', hidden: true },
]

const router = new Router({
    // mode: 'history', //后端支持可开
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRouterMap,
})

export default router
