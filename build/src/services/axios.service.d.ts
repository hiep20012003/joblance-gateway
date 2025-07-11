import axios from 'axios';
export declare class AxiosService {
    axios: ReturnType<typeof axios.create>;
    constructor(baseUrl: string, serviceName: string);
    axiosCreateInstance(baseUrl: string, serviceName?: string): ReturnType<typeof axios.create>;
}
