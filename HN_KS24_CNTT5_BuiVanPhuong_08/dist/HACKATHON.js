"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Member {
    static nextId = 1;
    memberId;
    name;
    contact;
    borrowedItems;
    constructor(name, contact) {
        this.memberId = Member.nextId++;
        this.name = name;
        this.contact = contact;
        this.borrowedItems = [];
    }
    getDetails() {
        return `Member ID: ${this.memberId}, Name: ${this.name}, Contact: ${this.contact}, Borrowed Items: ${this.borrowedItems.length}`;
    }
}
class LibraryItem {
    static nextId = 1;
    id;
    title;
    isAvailable;
    constructor(title) {
        this.id = LibraryItem.nextId++;
        this.title = title;
        this.isAvailable = true;
    }
    borrowItem() {
        if (this.isAvailable) {
            this.isAvailable = false;
        }
    }
    returnItem() {
        this.isAvailable = true;
    }
}
class Book extends LibraryItem {
    author;
    constructor(title, author) {
        super(title);
        this.author = author;
    }
    calculateLateFee(daysOverdue) {
        return daysOverdue * 10000;
    }
    getLoanPeriod() {
        return 30;
    }
    getItemType() {
        return "Book";
    }
}
class Magazine extends LibraryItem {
    issueNumber;
    constructor(title, issueNumber) {
        super(title);
        this.issueNumber = issueNumber;
    }
    calculateLateFee(daysOverdue) {
        return daysOverdue * 5000;
    }
    getLoanPeriod() {
        return 7;
    }
    getItemType() {
        return "Magazine";
    }
}
class Loan {
    static nextId = 1;
    loanId;
    member;
    item;
    dueDate;
    isReturned;
    constructor(member, item, dueDate) {
        this.loanId = Loan.nextId++;
        this.member = member;
        this.item = item;
        this.dueDate = dueDate;
        this.isReturned = false;
    }
    getDetails() {
        return `Loan ID: ${this.loanId}, Member: ${this.member.getDetails()}, Item: ${this.item.title}, Due Date: ${this.dueDate.toDateString()}, Returned: ${this.isReturned}`;
    }
}
class Library {
    items = [];
    members = [];
    loans = [];
    addItem(item) {
        this.items.push(item);
    }
    addMember(name, contact) {
        const member = new Member(name, contact);
        this.members.push(member);
        return member;
    }
    borrowItem(memberId, itemId) {
        let member = this.findEntityById(this.members, memberId);
        let item = this.findEntityById(this.items, itemId);
        if (member && item && item.isAvailable) {
            item.borrowItem();
            let dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + item.getLoanPeriod());
            let loan = new Loan(member, item, dueDate);
            this.loans.push(loan);
            member.borrowedItems.push(item);
            return loan;
        }
        console.log(`Không có tài liệu này hoặc ID thành viên không hợp lệ.`);
        return null;
    }
    returnItem(itemId) {
        let loanIndex = this.loans.findIndex(loan => loan.item.id === itemId && !loan.isReturned);
        if (loanIndex !== -1) {
            let loan = this.loans[loanIndex];
            loan.isReturned = true;
            this.calculateTotalLateFees();
            let lateFee = loan.item.calculateLateFee(daysOverdue);
            loan.item.returnItem();
            let memberIndex = this.members.findIndex(member => member.memberId === loan.member.memberId);
            if (memberIndex !== -1) {
                this.members[memberIndex].borrowedItems = this.members[memberIndex].borrowedItems.filter(item => item.id !== itemId);
            }
            return lateFee > 0 ? lateFee : 0;
        }
        console.log(`Không tìm thấy lượt mượn cho tài liệu này.`);
        return 0;
    }
    listAvailableItems() {
        let availableItems = this.items.filter(item => item.isAvailable);
        if (availableItems.length > 0) {
            console.log("Danh sách tài liệu có sẵn:");
            availableItems.filter(item => console.log(`- ${item.title} (${item.getItemType()})`));
        }
        else {
            console.log("Không có tài liệu nào có sẵn.");
        }
    }
    listMemberLoans(memberId) {
        let member = this.findEntityById(this.members, memberId);
        if (member) {
            let memberLoans = this.loans.filter(loan => loan.member.memberId === memberId && !loan.isReturned);
            if (memberLoans.length > 0) {
                console.log(`Danh sách tài liệu đang mượn của thành viên ${member.name}:`);
                memberLoans.forEach(loan => console.log(`- ${loan.item.title} (Due: ${loan.dueDate.toDateString()})`));
            }
            else {
                console.log(`Thành viên ${member.name} không có tài liệu nào đang mượn.`);
            }
        }
        else {
            console.log(`Không tìm thấy thành viên với ID ${memberId}.`);
        }
    }
    calculateTotalLateFees() {
        return this.loans.reduce((total, loan) => {
            if (loan.isReturned) {
                let daysOverdue = Math.ceil((new Date().getTime() - loan.dueDate.getTime()) / (1000 * 3600 * 24));
                return total + loan.item.calculateLateFee(daysOverdue);
            }
            return total;
        }, 0);
    }
    getItemTypeCount() {
        let typeCount = {};
        this.items.reduce((count, item) => {
            let type = item.getItemType();
            count[type] = (count[type] || 0) + 1;
            return count;
        }, typeCount);
        console.log("Số lượng từng loại tài liệu:");
        Object.entries(typeCount).forEach(([type, count]) => {
            console.log(`- ${type}: ${count}`);
        });
    }
    updateItemTitle(itemId, newTitle) {
        let itemIndex = this.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            this.items[itemIndex].title = newTitle;
            console.log(`Cập nhật tiêu đề tài liệu ID ${itemId} thành "${newTitle}".`);
        }
        else {
            console.log(`Không tìm thấy tài liệu với ID ${itemId}.`);
        }
    }
    findEntityById(collection, id) {
        return collection.find(entity => 'id' in entity ? entity.id === id : entity.memberId === id);
    }
}
class LibraryApp {
    libary;
    constructor() {
        this.libary = new Library();
    }
    addItem() {
        let itemType = prompt("Nhập loại tài liệu (Sách/Tạp chí):");
        let title = prompt("Nhập tiêu đề tài liệu:");
        if (itemType?.toLowerCase() === "sách") {
            let author = prompt("Nhập tên tác giả:");
            let book = new Book(title, author);
            this.libary.addItem(book);
            console.log(`Đã thêm sách: ${book.title} của tác giả ${author}.`);
        }
        else if (itemType?.toLowerCase() === "tạp chí") {
            let issueNumber = parseInt(prompt("Nhập số phát hành:") || "0");
            let magazine = new Magazine(title, issueNumber);
            this.libary.addItem(magazine);
            console.log(`Đã thêm tạp chí: ${magazine.title}, Số phát hành: ${issueNumber}.`);
        }
        else {
            console.log("Loại tài liệu không hợp lệ. Vui lòng nhập 'Sách' hoặc 'Tạp chí'.");
        }
    }
    addMember() {
        let name = prompt("Nhập tên thành viên:");
        let contact = prompt("Nhập thông tin liên hệ:");
        let member = this.libary.addMember(name, contact);
        console.log(`Đã thêm thành viên: ${member.name}, ID: ${member.memberId}.`);
    }
    borrowItem() {
        let memberId = parseInt(prompt("Nhập ID thành viên:") || "0");
        let itemId = parseInt(prompt("Nhập ID tài liệu:") || "0");
        let loan = this.libary.borrowItem(memberId, itemId);
        if (loan) {
            console.log(`Đã mượn tài liệu: ${loan.item.title} cho thành viên ${loan.member.name}.`);
        }
        else {
            console.log("Không thể mượn tài liệu. Vui lòng kiểm tra lại ID thành viên và tài liệu.");
        }
    }
    returnItem() {
        let itemId = parseInt(prompt("Nhập ID tài liệu để trả:") || "0");
        let lateFee = this.libary.returnItem(itemId);
        if (lateFee > 0) {
            console.log(`Tài liệu đã được trả. Phí phạt trễ hạn là: ${lateFee} VNĐ.`);
        }
        else {
            console.log("Tài liệu đã được trả thành công.");
        }
    }
    listAvailableItems() {
        this.libary.listAvailableItems();
    }
    listMemberLoans() {
        let memberId = parseInt(prompt("Nhập ID thành viên để xem tài liệu đang mượn:") || "0");
        this.libary.listMemberLoans(memberId);
    }
    calculateTotalLateFees() {
        let totalLateFees = this.libary.calculateTotalLateFees();
        console.log(`Tổng phí phạt đã thu được: ${totalLateFees} VNĐ.`);
    }
    getItemTypeCount() {
        this.libary.getItemTypeCount();
    }
    updateItemTitle() {
        let itemId = parseInt(prompt("Nhập ID tài liệu cần cập nhật tiêu đề:") || "0");
        let newTitle = prompt("Nhập tiêu đề mới:");
        this.libary.updateItemTitle(itemId, newTitle);
    }
    findEntityById() {
        let entityType = prompt("Nhập loại đối tượng (Member/Item):");
        let id = parseInt(prompt("Nhập ID đối tượng:") || "0");
        if (entityType?.toLowerCase() === "member") {
            let member = this.libary.findEntityById(this.libary.members, id);
            if (member) {
                console.log(`Tìm thấy thành viên: ${member.getDetails()}`);
            }
            else {
                console.log(`Không tìm thấy thành viên với ID ${id}.`);
            }
        }
        else if (entityType?.toLowerCase() === "item") {
            let item = this.libary.findEntityById(this.libary.items, id);
            if (item) {
                console.log(`Tìm thấy tài liệu: ID ${item.id}, Tiêu đề: ${item.title}, Loại: ${item.getItemType()}`);
            }
            else {
                console.log(`Không tìm thấy tài liệu với ID ${id}.`);
            }
        }
        else {
            console.log("Loại đối tượng không hợp lệ. Vui lòng nhập 'Member' hoặc 'Item'.");
        }
    }
    showMenu() {
        alert("Chào mừng đến với Thư viện! Vui lòng chọn một chức năng:");
        let menu = `
        1. Thêm thành viên mới
        2. Thêm tài liệu mới (Sách/Tạp chí)
        3. Mượn tài liệu
        4. Trả tài liệu
        5. Hiển thị danh sách tài liệu có sẵn
        6. Hiển thị danh sách tài liệu đang mượn của một thành viên
        7. Tính và hiển thị tổng phí phạt đã thu
        8. Thống kê số lượng từng loại tài liệu
        9. Cập nhật tiêu đề một tài liệu
        10. Tìm kiếm thành viên hoặc tài liệu theo ID
        11. Thoát chương trình
        `;
        let choice = parseInt(prompt(menu) || "0");
        switch (choice) {
            case 1:
                this.addMember();
                break;
            case 2:
                this.addItem();
                break;
            case 3:
                this.borrowItem();
                break;
            case 4:
                this.returnItem();
                break;
            case 5:
                this.listAvailableItems();
                break;
            case 6:
                this.listMemberLoans();
                break;
            case 7:
                this.calculateTotalLateFees();
                break;
            case 8:
                this.getItemTypeCount();
                break;
            case 9:
                this.updateItemTitle();
                break;
            case 10:
                this.findEntityById();
                break;
            case 11:
                console.log("Cảm ơn bạn. Hẹn gặp lại!");
                return;
            default:
                console.log("Lựa chọn không hợp lệ. Vui lòng thử lại.");
        }
        this.showMenu();
    }
}
//# sourceMappingURL=HACKATHON.js.map
