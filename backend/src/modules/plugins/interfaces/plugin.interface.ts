export interface IPlugin {
  id: string;
  name: string;
  slug: string;
  version: string;
  enabled: boolean;
  init(): Promise<void>;
  destroy(): Promise<void>;
}
