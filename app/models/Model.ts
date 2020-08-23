import { v4 } from 'uuid';

import { client } from '@/hooks/api';


/**
 * Props for the Model
 */
export interface ModelProps {
  uuid?: string;
}

export const modelize = <T extends ModelProps>(namespace: string, fields: Array<keyof Required<T>>) => {
  class Model {
    public static namespace = 'models';
    public static fields = fields;
    public created: boolean;
    public uuid: string;

    constructor(props: T) {
      this.created = Boolean(props.uuid);
      this.uuid = props.uuid ?? v4();
    }

    static get client() {
      return client.value;
    }

    get client() {
      return (this.constructor as typeof Model).client;
    }

    get $values(): Required<T> {
      const entries = fields.map(key => [key, this[key as keyof ThisType<T>]]);

      return Object.fromEntries(entries);
    }

    static async retrieve<Y>(this: new (props: T) => Y, uuid: string) {
      const values = await client.value.retrieve<T>(namespace, uuid);
      const instance = new this(values);

      return instance;
    }

    static async list<Y>(this: new (props: T) => Y) {
      const list = await client.value.list<T>(namespace);
      const instances = list.map(values => new this(values));

      return instances;
    }

    async save() {
      if (this.created) {
        return this.client.update<T>(namespace, this.uuid, this.$values);
      }

      const response = await this.client.create<T>(namespace, this.$values);
      this.created = true;

      return response;
    }

    async remove() {
      const response = await this.client.remove<T>(namespace, this.uuid);
      this.created = false;

      return response;
    }
  }

  return Model;
};