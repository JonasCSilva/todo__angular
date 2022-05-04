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

type BoardsMetadata = { name: string; references: string[] }[];

type Boards = Items[];

@Component({
  selector: 'app-todos-list',
  templateUrl: './todos-list.component.html',
  styleUrls: ['./todos-list.component.scss'],
})
export class TodosListComponent implements OnInit {
  private itemsCollection!: AngularFirestoreCollection<ItemWithoutId>;
  private itemDoc!: AngularFirestoreDocument;

  public boardsMetadata: BoardsMetadata = [];

  public boardsContent: Boards = [];

  public isSaving = false;

  private items: Items = [];

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
    next: (documentData?: { boards: BoardsMetadata }) => {
      if (documentData) this.boardsMetadata = documentData.boards;
      this.organizeItem();
    },
    error: (err: any) => console.error('Observer got an error: ' + err),
    complete: () => console.log('Observer got a complete notification'),
  };

  private organizeItem() {
    if (
      !this.boardsMetadata ||
      !this.items ||
      this.boardsMetadata.length < 1 ||
      this.items.length < 1
    )
      return;
    this.boardsContent = [];
    this.boardsMetadata.forEach((boardMetadata, index) => {
      if (!this.boardsContent[index]) this.boardsContent[index] = [];
      boardMetadata.references.forEach((reference) => {
        const todo = this.items.find((element) => element.id === reference);
        if (todo) this.boardsContent[index].push(todo as Item);
      });
    });
  }

  ngOnInit(): void {
    this.itemsCollection = this.afs.collection(
      'deleteme/6cxhpFWhTNiZBu4ZgjoU/items'
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
      .subscribe(this.observer1);

    this.itemDoc = this.afs.doc('deleteme/6cxhpFWhTNiZBu4ZgjoU');
    this.itemDoc
      .snapshotChanges()
      .pipe(
        take(1),
        map((action) => {
          return action.payload.data() as { boards: BoardsMetadata };
        })
      )
      .subscribe(this.observer2);
  }

  updateItem(
    previousContainer: CdkDropList<Items>,
    container: CdkDropList<Items>
  ) {
    this.isSaving = true;

    const newBoardsMetadata = [...this.boardsMetadata];

    newBoardsMetadata[Number(previousContainer.id.slice(-1))].references =
      previousContainer.data.map((item) => item.id);
    newBoardsMetadata[Number(container.id.slice(-1))].references =
      container.data.map((item) => item.id);

    this.itemDoc
      .update({
        boards: newBoardsMetadata,
      })
      .then(() => {
        this.isSaving = false;
      });
  }

  updateItem2() {
    this.isSaving = true;

    this.itemDoc
      .update({
        boards: this.boardsMetadata,
      })
      .then(() => {
        this.isSaving = false;
      });
  }

  dropTodos(event: CdkDragDrop<Items>) {
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

  dropBoards(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.boardsMetadata,
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(
      this.boardsContent,
      event.previousIndex,
      event.currentIndex
    );
    this.updateItem2();
  }

  changeCheck(event: boolean, itemId: string) {
    this.isSaving = true;
    this.afs
      .doc('deleteme/6cxhpFWhTNiZBu4ZgjoU/items/' + itemId)
      .update({ checked: event })
      .then(() => {
        this.isSaving = false;
      });
  }
}
