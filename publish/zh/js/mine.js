/* Scroll to a specific element */
function scrollToElement(selector, duration = 1000) {
    $('html, body').animate({
        scrollTop: $(selector).offset().top - 70
    }, duration);
}

$(function(){
    // logo click
    $("#header-section img").click(function(){
        window.location.href = '/zh/';
    })

    // style selection acions
    $(".card-body").click(function(){
        $(this).toggleClass("selected");
        id = $(this).data("id");
        if($(this).hasClass("selected")){
            $("#"+id).prop("checked", true);
            $(".large-checkbox", this).prop("checked", true);
        } else {
            $("#"+id).prop("checked", false);
            $(".large-checkbox", this).prop("checked", false);
        }
    });

    // scroll to actions
    $('#get-started').click(function(){
        scrollToElement('#art-style-pick-section');
    });

    // form submit action
    $("#submit").click(function () {
        // validate fields first
        if (!validate_fields()) {
            return
        }

        var formData = new FormData();

        var artStyles = $('input[name="art_styles"]:checked').map(function() {
            return this.value;
        }).get().join(',');

        formData.append('portrait', $('#photo')[0].files[0]);
        formData.append('email', $('#email').val());
        formData.append('art_styles', artStyles);
        formData.append('lang_code', get_lang_code());
        formData.append('upload_langcode', 'zh');

        $(this).prop('disabled', true).removeClass('btn-success').addClass('btn-primary').text('上传中... (请耐心等待)');
        $.ajax({
            url: 'https://api.artfyyou.com/upload',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                alert('Your portrait has been successfully uploaded!');
                $("#submit").prop('disabled', false).removeClass('btn-primary').addClass('btn-success').text('提交');
                $("#photo").val('');
                $("#email").val('');
                $('input[name="art_styles"]').prop('checked', false);
                $('.card-body').removeClass('selected');
                $('#form').hide()
                $('#success_prompt').fadeIn(function(){
                    scrollToElement('#success_prompt');
                });
            },
            error: function(response) {
                console.log(response)
                alert('啊呀，有错误发生了: ' + response.responseText)
                $("#submit").prop('disabled', false).removeClass('btn-primary').addClass('btn-success').text('提交');
            }
        });
    });

    function validate_fields() {
        /* check file field first */
        var file_field = $('#photo');
        var allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'heic', 'webp'];
        var fileName = file_field.val();

        if (fileName) {
            var fileExtension = fileName.split('.').pop().toLowerCase();
            
            // Check if the file extension is in the list of allowed extensions
            if ($.inArray(fileExtension, allowedExtensions) !== -1) {
            } else {
                alert("照片文件类型不符合要求. 请上传以 'png', 'jpg', 'jpeg', 'gif', 'heic', 'webp'为后缀名的文件 ");
                file_field.val(''); // Clear the input
                return false
            }
        } else {
            alert("请选择肖像照上传");
            return false
        }

        /* check email */
        var email_field = $('#email');
        var email = email_field.val();
        var isValidEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
        if (!isValidEmail) {
            alert("邮箱地址格式不合法，请输入合法的邮箱地址")
            return false
        }

        /* check styles */
        var isStyleSelected = $('input[name="art_styles"]:checked').length > 0;
        if (!isStyleSelected) {
            alert("请选择至少一种艺术风格")
            scrollToElement('#art-style-pick-section');
            return false
        }

        return true
    }

    function get_lang_code() {
        var userLang = navigator.language || navigator.userLanguage; 
        if(userLang.startsWith('zh')) {
            return 'zh';
        } else {
            return 'en';
        }        
    }
})
