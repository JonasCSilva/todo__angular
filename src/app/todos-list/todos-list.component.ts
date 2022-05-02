import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { map } from 'rxjs';

type ItemWithoutID = {
  name: string;
  index: number;
  status: string;
};

type Item = ItemWithoutID & {
  id: string;
};

type Items = Item[];

@Component({
  selector: 'app-todos-list',
  templateUrl: './todos-list.component.html',
  styleUrls: ['./todos-list.component.scss'],
})
export class TodosListComponent implements OnInit {
  private itemsCollection!: AngularFirestoreCollection<ItemWithoutID>;
  todo: Items = [];
  done: Items = [];

  constructor(private afs: AngularFirestore) {}

  observer = {
    next: (x: Items) => this.organizeItem(x),
    error: (err: any) => console.error('Observer got an error: ' + err),
    complete: () => console.log('Observer got a complete notification'),
  };

  private organizeItem(x: Items) {
    this.todo = [];
    this.done = [];
    x.forEach((item) => {
      if (item.status === 'todo') {
        this.todo.push(item);
      } else if (item.status === 'done') {
        this.done.push(item);
      }
    });
  }

  ngOnInit(): void {
    this.itemsCollection = this.afs.collection('deleteme', (ref) =>
      ref.orderBy('index')
    );
    this.itemsCollection
      .snapshotChanges(['added', 'removed'])
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .subscribe(this.observer);
  }

  updateItem(
    previousIndex: number,
    currentIndex: number,
    containerId: string,
    previousContainerId?: string
  ) {
    if (containerId === 'cdk-drop-list-0' && !previousContainerId) {
      this.itemsCollection
        .doc(this.todo[currentIndex].id)
        .update({ index: currentIndex });
      this.itemsCollection
        .doc(this.todo[previousIndex].id)
        .update({ index: previousIndex });
    } else if (containerId === 'cdk-drop-list-1' && !previousContainerId) {
      this.itemsCollection
        .doc(this.done[currentIndex].id)
        .update({ index: currentIndex });
      this.itemsCollection
        .doc(this.done[previousIndex].id)
        .update({ index: previousIndex });
    }
  }

  drop(event: CdkDragDrop<Items>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.updateItem(
        event.previousIndex,
        event.currentIndex,
        event.container.id
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.updateItem(
        event.previousIndex,
        event.currentIndex,
        event.container.id,
        event.previousContainer.id
      );
    }
  }
}
