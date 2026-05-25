import Swal from 'sweetalert2';

const NotifAlert = ({ icon, title, message }) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: message,
        showConfirmButton: false,
        position: 'center',
        timer: 2000,
    });
};

const NotifOk = ({ icon, title, message }) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: message,
        html: message.replace(/\n/g, '<br/>'),
    });
};

const NotifConfirmDialog = ({
    icon,
    title,
    message,
    onConfirm,
    onCancel,
    confirmButtonText = 'Hapus',
}) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: message,
        showCancelButton: true,
        cancelButtonColor: '#23A55A',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33000',
        confirmButtonText: confirmButtonText,
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) {
            onConfirm();
        } else if (result.dismiss) {
            onCancel();
        }
    });
};

const QuestionConfirmSubmit = ({ icon, title, message, onConfirm, onCancel }) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: message,
        showCancelButton: true,
        cancelButtonColor: '#23A55A',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33000',
        confirmButtonText: 'Proses',
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) {
            onConfirm();
        } else if (result.dismiss) {
            onCancel();
        }
    });
};

export { NotifAlert, NotifOk, NotifConfirmDialog, QuestionConfirmSubmit };
