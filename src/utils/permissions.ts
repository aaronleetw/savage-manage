export const permissions = {
    allowViewEvent: {
        name: "Allow View Event",
        description: "Allows the user to view all events on Planner. Users will still be able to see events they have permissions to even if they do not have this permission.",
    },
    allowCreateEvent: {
        name: "Allow Create Event",
        description: "Allows the user to create events on Planner",
    },
    allowEditEvent: {
        name: "Allow Edit Event",
        description: "Allows the user to edit and delete events on Planner, in addition to RSVP permissions.",
    },
    allowViewAllInfo: {
        name: "Allow View All Info",
        description: "Allows the user to view all user-related information. Users will still be able to see their own information even if they do not have this permission.",
    },
    allowCreateUser: {
        name: "Allow Create User",
        description: "Allows the user to create users.",
    },
    allowEditUser: {
        name: "Allow Edit User",
        description: "Allows the user to edit and delete users, in addition to role and account type management. Users will still be able to edit their own profile even if they do not have this permission.",
    },
    allowViewFinances: {
        name: "Allow View Finances",
        description: "Allows the user to view finance transactions related to their account.",
    },
    allowViewAllFinances: {
        name: "Allow View All Finances",
        description: "Allows the user to view all finance transactions. This permission overrides the Allow View Finances permission.",
    },
    allowCreateTransaction: {
        name: "Allow Create Finance",
        description: "Allows the user to create finance transactions and transactional events.",
    },
    allowEditTransaction: {
        name: "Allow Edit Finance",
        description: "Allows the user to edit and delete finance transactions and transactional events.",
    },
    allowApproveTransaction: {
        name: "Allow Approve Transaction",
        description: "Allows the user to approve finance transactions and transactional events.",
    },
    allowReimburseTransaction: {
        name: "Allow Reimburse Transaction",
        description: "Allows the user to reimburse finance transactions and transactional events.",
    },
}