declare module "mailgun.js" {
  interface ClientOpts {
    username: string;
    key: string;
  }

  interface MailgunClient {
    messages: {
      create(
        domain: string,
        opts: CreateMessageOpts,
      ): Promise<CreateMessageRsp>;
    };
  }

  interface CreateMessageOpts {
    from: string;
    to: string[];
    subject: string;
    text: string;
    html: string;
  }

  interface CreateMessageRsp {
    id: string;
    message: string;
  }

  export function client(opts: ClientOpts): MailgunClient;
}
