export type User = {
    id: number,
    first_name: string,
    second_name: string,
    login: string,
    display_name?: string,
    email: string,
    password?: string | null,
    phone: string,
    avatar?: string,
};
