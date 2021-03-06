import API from '@/api/problemList'

export default {
    state: {
        problemList: {
            problems: [],
            sharedWith: [],
        },
    },

    mutations: {
        ADD_PROBLEM(context, problem) {
            context.problemList.problems.push(problem)
        },

        SET_PROBLEM_LIST(context, problemList) {
            context.problemList = problemList
        },
    },

    actions: {
        async fetchProblemList(context, problemListId) {
            const response = await API.fetchProblemList(problemListId)

            context.commit('SET_PROBLEM_LIST', response.data)
        },

        async addProblemToProblemList(context, { platform, title, problemId, link }) {
            const problemListId = context.state.problemList._id
            const response = await API.addProblemToProblemList(problemListId, platform, title, problemId, link)
            context.commit('ADD_PROBLEM', response.data)
        },

        async addProblemListToClassroom(context, classroomId) {
            const problemListId = context.state.problemList._id
            await API.addProblemListToClassroom(problemListId, classroomId)
            await context.dispatch('fetchProblemList', problemListId)
        },

        async removeProblemListFromClassroom(context, { problemListId, classroomId }) {
            await API.removeProblemListFromClassroom(problemListId, classroomId)
            await context.dispatch('fetchProblemList', problemListId)
        },

        async removeProblemFromProblemList(context, { problemListId, problemId }) {
            await API.removeProblemFromProblemList(problemListId, problemId)
            await context.dispatch('fetchProblemList', problemListId)
        },
    },
}
