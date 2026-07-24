import { tableWrapClasses } from "../table/Table.classes";

/**
 * VirtualTable renders through the shared TableView, so its visual recipes
 * live in ../table/Table.classes. The wrapper classes are re-exported here
 * so the virtualized entry stays self-describing.
 */
export const virtualTableClasses = tableWrapClasses;
