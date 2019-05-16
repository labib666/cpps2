import Admin from '@/api/admin'

const admin = {
    state: {
        users: [],
    },

    mutations: {
        CLEAR_USER_LIST: (state) => {
            state.users = []
        },
        ADD_TO_LIST: (state, usersToAdd) => {
            state.users.push(...usersToAdd)
        },
    },

    actions: {
        ClearUserList({ commit, state }) {
            commit('CLEAR_USER_LIST')
        },
        FetchUserList({ commit, state }, {
            listName = 'Admins',
            filter = {},
        }) {
            return new Promise((resolve, reject) => {
                const skip = state.users.length
                Admin.getUserList(listName, skip, filter).then(({ users: usersToAdd }) => {
                    commit('ADD_TO_LIST', usersToAdd)
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        },
    },
}

export default admin
