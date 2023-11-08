#/bin/sh

bucket="autoboxes"
domain="robotbox.es"
pagename="${2}"

reponame=$(basename $1 .git)

echo "publishing ${pagename}"

for i in $(backblaze-b2 list-file-names $bucket "${domain}/${pagename}/" | egrep -o '"fileId": "(.*)"' | cut -d "\"" -f 4)
do
    backblaze-b2 delete-file-version $i
done

tempdir = $(apg -n 1 -d -M L)

mkdir $tempdir
cd $tempdir

echo "downloading repo: ${reponame}"

git clone $1

for i in $(find $reponame -not -path '*/.*' -type f)
do
    trimmedname=${i#"$reponame/"}
    echo $trimmedname
    echo $pagename
    objectname="${domain}/${pagename}/${trimmedname}"
    echo $objectname
    backblaze-b2 upload_file $bucket "$i" "$objectname"
done

cd ..

rm -rf $tempdir