/** 道具配置，由 Luban item.csv 导出。 */
export interface ItemConfig {
    /** 道具唯一 id。 */
    id: number;
    /** 道具显示名称。 */
    name: string;
    /** 图标资源路径。 */
    icon: string;
    /** 品质等级。 */
    quality: number;
    /** 描述文本。 */
    desc: string;
}
