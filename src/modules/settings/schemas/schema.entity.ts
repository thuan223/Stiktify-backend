import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({ timestamps: true })
export class Setting {
  @Prop({
    type: {
      wishListCount: Number,
      wishListScoreCount: Number,
    },
    required: true,
  })
  numberOfCount: { wishListCount: number; wishListScoreCount: number };

  @Prop({
    type: {
      discountScore: Number,
      wasCheckScore: Boolean,
    },
    required: true,
  })
  resetScore: { discountScore: number; wasCheckScore: boolean };

  @Prop({
    type: {
      triggerAction: Number,
      collaboration: Number,
      trending: Number,
      random: Number,
    },
    required: true,
  })
  numberVideoSuggest: {
    triggerAction: number;
    collaboration: number;
    trending: number;
    random: number;
  };

  @Prop({
    type: {
      numberCollaborator: Number,
      numberWishListVideo: Number,
    },
    required: true,
  })
  collaborativeFiltering: { numberCollaborator: number; numberWishListVideo: number };

  @Prop({
    type: {
      watchVideo: Number,
      reactionAboutVideo: Number,
      reactionAboutMusic: Number,
      clickLinkMusic: Number,
      followCreator: Number,
      listenMusic: Number,
      commentVideo: Number,
      searchVideo: Number,
      searchMusic: Number,
      shareVideo: Number,
    },
    required: true,
  })
  scoreIncrease: {
    watchVideo: number;
    reactionAboutVideo: number;
    reactionAboutMusic: number;
    clickLinkMusic: number;
    followCreator: number;
    listenMusic: number;
    commentVideo: number;
    searchVideo: number;
    searchMusic: number;
    shareVideo: number;
  };
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
