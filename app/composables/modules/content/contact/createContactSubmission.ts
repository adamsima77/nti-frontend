export const createSubmission = async (submission: Object) => {
    const { post } = useApi()
    return await post('/contact', submission).catch((e: any) => Promise.reject(e))
}