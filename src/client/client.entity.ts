import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  RelationCount,
  BeforeInsert,
  Unique,
  ManyToOne,
} from 'typeorm';

import slugify from 'slugify';

import Offer from '../offer/offer.entity';
import User from '../user/user.entity';

@Entity()
@Unique(['name', 'slug'])
class Client {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  public name: string;

  @Column()
  public phone: string;

  @Column()
  public slug: string;

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(this.name, { lower: true });
  }

  @OneToMany(() => Offer, (offer: Offer) => offer.owner)
  public offers: Offer[];

  @RelationCount((client: Client) => client.offers)
  public offerCount: number;

  @ManyToOne(() => User, (user: User) => user.clients)
  public accountManager: User;

  @Column("tsvector", { select: false })
  documentWithWeights: any;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}

export default Client;
