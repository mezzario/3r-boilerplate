export interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
}

export enum TodosView {
    All,
    Active,
    Completed,
}
