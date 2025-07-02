
export default interface CategoryType{
    id: number;
    name: string;
    parentId: number | null;
    Parent: CategoryType | null;
    Children: CategoryType[];
}