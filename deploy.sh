SAS="sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2020-06-25T15:43:55Z&st=2019-11-16T08:43:55Z&spr=https&sig=aTfX%2F3QwCWFex%2BDE3avvS946JqQnsE6xFJ10r744MIg%3D"
azcopy copy "$HOME/dev/cognitive-demo/*" "https://bcmisc.blob.core.windows.net/\$web?$SAS" --recursive --overwrite
azcopy copy "$HOME/dev/cognitive-demo/js*" "https://bcmisc.blob.core.windows.net/\$web?$SAS" --recursive --overwrite --no-guess-mime-type --content-type "application/javascript"
azcopy rm "https://bcmisc.blob.core.windows.net/\$web?$SAS" --recursive --exclude="config.js;*.mjs;*.html;*.css;*.png;*.gif"
