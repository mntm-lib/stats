export type Params = Partial<{
  category: string;
  label: string;
  screen: string;
  params: Record<string, unknown>;
}>;

export type ProviderSend = (event: string, params: Params) => Promise<boolean>;

export type Provider = {
  send: ProviderSend;
};
