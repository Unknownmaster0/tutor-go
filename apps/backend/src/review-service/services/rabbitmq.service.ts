import { RabbitMQPublisher } from '../../shared/rabbitmq/publisher';
import { ReviewSubmittedEvent, RoutingKey } from '../../shared/rabbitmq/types';

export class RabbitMQService {
  private publisher: RabbitMQPublisher;

  constructor(publisher: RabbitMQPublisher) {
    this.publisher = publisher;
  }

  async publishReviewSubmittedEvent(event: ReviewSubmittedEvent): Promise<void> {
    await this.publisher.publish(RoutingKey.REVIEW_SUBMITTED, event);
  }
}
