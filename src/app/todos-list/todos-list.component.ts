import {
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { map, take } from 'rxjs';
import { Item, Items, ItemWithoutId } from 'src/utils/types';

type References = { todo: string[]; done: string[] };

@Component({
  selector: 'app-todos-list',
  templateUrl: './todos-list.component.html',
  styleUrls: ['./todos-list.component.scss'],
})
export class TodosListComponent implements OnInit {
  private itemsCollection!: AngularFirestoreCollection<ItemWithoutId>;
  private itemDoc!: AngularFirestoreDocument;

  private references: References = { todo: [], done: [] };

  private items: Items = [];

  todo: Items = [];
  done: Items = [];

  constructor(private afs: AngularFirestore) {}

  observer1 = {
    next: (items: Items) => {
      this.items = items;
      this.organizeItem();
    },
    error: (err: any) => console.error('Observer got an error: ' + err),
    complete: () => console.log('Observer got a complete notification'),
  };

  observer2 = {
    next: (documentData?: References) => {
      if (documentData) this.references = documentData;
      this.organizeItem();
    },
    error: (err: any) => console.error('Observer got an error: ' + err),
    complete: () => console.log('Observer got a complete notification'),
  };

  private organizeItem() {
    if (!this.references || !this.items) return;
    this.todo = [];
    this.done = [];
    this.references.todo.forEach((reference) => {
      const todo = this.items.find((element) => element.id === reference);
      if (todo) this.todo.push(todo as Item);
    });
    this.references.done.forEach((reference) => {
      const done = this.items.find((element) => element.id === reference);
      if (done) this.done.push(done as Item);
    });
  }

  ngOnInit(): void {
    this.itemsCollection = this.afs.collection(
      'deleteme/6cxhpFWhTNiZBu4ZgjoU/items'
    );
    this.itemsCollection
      .snapshotChanges(/* ['added', 'removed'] */)
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .subscribe(this.observer1);

    this.itemDoc = this.afs.doc('deleteme/6cxhpFWhTNiZBu4ZgjoU');
    this.itemDoc
      .snapshotChanges()
      .pipe(
        take(1),
        map((action) => {
          return action.payload.data() as References;
        })
      )
      .subscribe(this.observer2);
  }

  updateItem(
    previousContainer: CdkDropList<Items>,
    container: CdkDropList<Items>
  ) {
    if (previousContainer.id === 'cdk-drop-list-0') {
      this.itemDoc.update({
        todo: previousContainer.data.map((item) => item.id),
      });
    } else if (previousContainer.id === 'cdk-drop-list-1') {
      this.itemDoc.update({
        done: previousContainer.data.map((item) => item.id),
      });
    }
    if (container.id === 'cdk-drop-list-0') {
      this.itemDoc.update({ todo: container.data.map((item) => item.id) });
    } else if (container.id === 'cdk-drop-list-1') {
      this.itemDoc.update({ done: container.data.map((item) => item.id) });
    }
  }

  drop(event: CdkDragDrop<Items>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.updateItem(event.previousContainer, event.container);
  }
}
